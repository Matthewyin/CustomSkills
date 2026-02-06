
import { ExcalidrawGenerator } from './generators/excalidraw.js';
import { DiagramSpec } from './types.js';

const generator = new ExcalidrawGenerator();

const spec: DiagramSpec = {
  format: 'excalidraw',
  title: '应用架构图',
  elements: [
    {
      id: 'frontend',
      type: 'container',
      name: 'Frontend',
      style: { fillColor: '#e0f7fa', strokeColor: '#006064', strokeWidth: 2 },
      geometry: { x: 50, y: 50, width: 300, height: 400 },
      children: [
        {
          id: 'web-app',
          type: 'node',
          name: 'Web Application (React)',
          shape: 'rect',
          geometry: { x: 20, y: 50, width: 260, height: 60 }
        },
        {
          id: 'mobile-app',
          type: 'node',
          name: 'Mobile App (Flutter)',
          shape: 'rect',
          geometry: { x: 20, y: 150, width: 260, height: 60 }
        }
      ]
    },
    {
      id: 'backend',
      type: 'container',
      name: 'Backend',
      style: { fillColor: '#fff3e0', strokeColor: '#e65100', strokeWidth: 2 },
      geometry: { x: 400, y: 50, width: 300, height: 400 },
      children: [
        {
          id: 'api-gateway',
          type: 'node',
          name: 'API Gateway',
          shape: 'rounded',
          geometry: { x: 20, y: 50, width: 260, height: 60 }
        },
        {
          id: 'auth-service',
          type: 'node',
          name: 'Auth Service',
          shape: 'rect',
          geometry: { x: 20, y: 150, width: 120, height: 60 }
        },
        {
          id: 'user-service',
          type: 'node',
          name: 'User Service',
          shape: 'rect',
          geometry: { x: 160, y: 150, width: 120, height: 60 }
        },
        {
          id: 'order-service',
          type: 'node',
          name: 'Order Service',
          shape: 'rect',
          geometry: { x: 20, y: 250, width: 120, height: 60 }
        },
        {
          id: 'product-service',
          type: 'node',
          name: 'Product Service',
          shape: 'rect',
          geometry: { x: 160, y: 250, width: 120, height: 60 }
        }
      ]
    },
    {
      id: 'database',
      type: 'container',
      name: 'Data Layer',
      style: { fillColor: '#e8eaf6', strokeColor: '#1a237e', strokeWidth: 2 },
      geometry: { x: 750, y: 50, width: 200, height: 400 },
      children: [
        {
          id: 'primary-db',
          type: 'node',
          name: 'Primary DB (PostgreSQL)',
          shape: 'cylinder',
          geometry: { x: 20, y: 100, width: 160, height: 80 }
        },
        {
          id: 'cache',
          type: 'node',
          name: 'Cache (Redis)',
          shape: 'cylinder',
          geometry: { x: 20, y: 250, width: 160, height: 80 }
        }
      ]
    },
    {
      type: 'edge',
      source: 'web-app',
      target: 'api-gateway',
      label: 'REST/GraphQL',
      id: 'edge-web-api'
    },
    {
      type: 'edge',
      source: 'mobile-app',
      target: 'api-gateway',
      label: 'REST',
      id: 'edge-mobile-api'
    },
    {
      type: 'edge',
      source: 'api-gateway',
      target: 'auth-service',
      id: 'edge-api-auth'
    },
    {
      type: 'edge',
      source: 'api-gateway',
      target: 'user-service',
      id: 'edge-api-user'
    },
    {
      type: 'edge',
      source: 'api-gateway',
      target: 'order-service',
      id: 'edge-api-order'
    },
    {
      type: 'edge',
      source: 'api-gateway',
      target: 'product-service',
      id: 'edge-api-product'
    },
    {
      type: 'edge',
      source: 'auth-service',
      target: 'primary-db',
      id: 'edge-auth-db'
    },
    {
      type: 'edge',
      source: 'user-service',
      target: 'primary-db',
      id: 'edge-user-db'
    },
    {
      type: 'edge',
      source: 'order-service',
      target: 'primary-db',
      id: 'edge-order-db'
    },
    {
      type: 'edge',
      source: 'product-service',
      target: 'cache',
      id: 'edge-product-cache'
    }
  ]
};

const outputPath = 'diagrams/excalidraw/app-architecture-v3.excalidraw';
// Ensure absolute path
import path from 'path';
const absolutePath = path.resolve(process.cwd(), outputPath);
console.log(`Generating to: ${absolutePath}`);

await generator.generate(spec, absolutePath);
console.log(`Generated: ${outputPath}`);
