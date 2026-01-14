/**
 * Example script to test Order APIs
 * Run with: ts-node examples/test-order-apis.ts
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

async function testRestAPI() {
  console.log('\n Testing REST API...\n');

  try {
    // 1. Create Order
    console.log(' Creating a new order...');
    const createOrderRequest: CreateOrderRequest = {
      customerId: 'customer-001',
      items: [
        {
          productId: 'prod-001',
          productName: 'MacBook Pro 16"',
          quantity: 1,
          price: 2499.99,
        },
        {
          productId: 'prod-002',
          productName: 'Magic Mouse',
          quantity: 2,
          price: 79.99,
        },
      ],
    };

    const createResponse = await axios.post(
      `${API_BASE_URL}/api/orders`,
      createOrderRequest
    );
    console.log('Order created:', createResponse.data);
    const orderId = createResponse.data.id;

    // 2. Get Order
    console.log('\n Getting order details...');
    const getResponse = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
    console.log(' Order details:', getResponse.data);

    // 3. Get All Orders
    console.log('\n Getting all orders...');
    const getAllResponse = await axios.get(`${API_BASE_URL}/api/orders?page=1&limit=10`);
    console.log('All orders:', getAllResponse.data);

  } catch (error: any) {
    console.error('REST API Error:', error.response?.data || error.message);
  }
}

async function testGraphQLAPI() {
  console.log('\n🟣 Testing GraphQL API...\n');

  try {
    // 1. Create Order via GraphQL
    console.log('1️⃣ Creating order via GraphQL...');
    const createMutation = `
      mutation {
        createOrder(input: {
          customerId: "customer-002"
          items: [
            {
              productId: "prod-003"
              productName: "iPhone 15 Pro"
              quantity: 1
              price: 999.99
            },
            {
              productId: "prod-004"
              productName: "AirPods Pro"
              quantity: 1
              price: 249.99
            }
          ]
        }) {
          id
          customerId
          totalAmount
          status
          createdAt
          message
        }
      }
    `;

    const createResponse = await axios.post(`${API_BASE_URL}/graphql`, {
      query: createMutation,
    });
    console.log('Order created:', createResponse.data.data.createOrder);
    const orderId = createResponse.data.data.createOrder.id;

    // 2. Get Order via GraphQL
    console.log('\n Getting order via GraphQL...');
    const getQuery = `
      query {
        order(id: "${orderId}") {
          id
          customerId
          items {
            productId
            productName
            quantity
            price
            subtotal
          }
          totalAmount
          status
          createdAt
          updatedAt
        }
      }
    `;

    const getResponse = await axios.post(`${API_BASE_URL}/graphql`, {
      query: getQuery,
    });
    console.log('Order details:', getResponse.data.data.order);

    // 3. Get All Orders via GraphQL
    console.log('\n Getting all orders via GraphQL...');
    const getAllQuery = `
      query {
        orders(page: 1, limit: 10) {
          id
          customerId
          totalAmount
          status
          createdAt
        }
      }
    `;

    const getAllResponse = await axios.post(`${API_BASE_URL}/graphql`, {
      query: getAllQuery,
    });
    console.log('All orders:', getAllResponse.data.data.orders);

  } catch (error: any) {
    console.error('GraphQL API Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('Starting API tests...');
  console.log('Make sure the server is running on http://localhost:3000');

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testRestAPI();
  await testGraphQLAPI();

  console.log('\n✨ All tests completed!\n');
}

main().catch(console.error);
