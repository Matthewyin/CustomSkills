import { MermaidGenerator } from './generators/mermaid.js';
import { DiagramSpec } from './types.js';

const generator = new MermaidGenerator();

const spec: DiagramSpec = {
  format: 'mermaid',
  title: 'Application Architecture',
  elements: [
    // Client Layer
    { id: 'client-layer', type: 'container', name: 'Client Layer', style: { fillColor: '#e1f5fe', strokeColor: '#01579b' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'web-app', type: 'node', name: 'Web Application (React)', shape: 'rect', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'mobile-app', type: 'node', name: 'Mobile App (Flutter)', shape: 'rect', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },

    // API Gateway Layer
    { id: 'api-gateway-layer', type: 'container', name: 'API Gateway Layer', style: { fillColor: '#fff3e0', strokeColor: '#e65100' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'api-gateway', type: 'node', name: 'API Gateway (Nginx/Kong)', shape: 'rounded', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },

    // Service Layer
    { id: 'service-layer', type: 'container', name: 'Service Layer', style: { fillColor: '#f3e5f5', strokeColor: '#4a148c' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'user-service', type: 'node', name: 'User Service', shape: 'rect', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'order-service', type: 'node', name: 'Order Service', shape: 'rect', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'product-service', type: 'node', name: 'Product Service', shape: 'rect', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },

    // Data Layer
    { id: 'data-layer', type: 'container', name: 'Data Layer', style: { fillColor: '#e8f5e9', strokeColor: '#1b5e20' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'primary-db', type: 'node', name: 'Primary DB (PostgreSQL)', shape: 'cylinder', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'redis-cache', type: 'node', name: 'Cache (Redis)', shape: 'cylinder', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },
    { id: 'message-queue', type: 'node', name: 'Message Queue (RabbitMQ)', shape: 'rounded', style: { fillColor: '#ffffff' }, geometry: { x: 0, y: 0, width: 0, height: 0 } },

    // Edges
    { id: 'edge1', type: 'edge', source: 'web-app', target: 'api-gateway' },
    { id: 'edge2', type: 'edge', source: 'mobile-app', target: 'api-gateway' },
    { id: 'edge3', type: 'edge', source: 'api-gateway', target: 'user-service' },
    { id: 'edge4', type: 'edge', source: 'api-gateway', target: 'order-service' },
    { id: 'edge5', type: 'edge', source: 'api-gateway', target: 'product-service' },
    { id: 'edge6', type: 'edge', source: 'user-service', target: 'primary-db' },
    { id: 'edge7', type: 'edge', source: 'order-service', target: 'primary-db' },
    { id: 'edge8', type: 'edge', source: 'product-service', target: 'primary-db' },
    { id: 'edge9', type: 'edge', source: 'product-service', target: 'redis-cache' },
    { id: 'edge10', type: 'edge', source: 'order-service', target: 'message-queue' }
  ]
};

const outputPath = 'diagrams/mermaid/app-architecture-mermaid.md';
// Ensure absolute path
import path from 'path';
const absolutePath = path.resolve(process.cwd(), outputPath);
console.log(`Generating to: ${absolutePath}`);

generator.generate(spec, absolutePath)
  .then(() => console.log('Generation complete'))
  .catch(err => console.error('Generation failed:', err));
