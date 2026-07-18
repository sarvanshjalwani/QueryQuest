// playgroundQuestions.js
const playgroundQuestions = [
  {
    id: 1,
    title: "Design a Users Table",
    question: "Create a table to store user information for a web application.",
    type: "schema_design",
    requirements: [
      "Table should be named 'users'",
      "Include an ID column as PRIMARY KEY",
      "Include username column (VARCHAR, NOT NULL, UNIQUE)",
      "Include email column (VARCHAR, NOT NULL, UNIQUE)",
      "Include created_at column (DATE, NOT NULL)",
      "Include is_active column (BOOLEAN, default true)"
    ],
    solved: 0
  },
  {
    id: 2,
    title: "Design a Products Table",
    question: "Create a table for an e-commerce product catalog.",
    type: "schema_design",
    requirements: [
      "Table should be named 'products'",
      "Include product_id as PRIMARY KEY",
      "Include product_name (VARCHAR, NOT NULL)",
      "Include price (DECIMAL, NOT NULL)",
      "Include stock_quantity (INTEGER, NOT NULL, default 0)",
      "Include category (VARCHAR)",
      "Include description (TEXT)"
    ],
    solved: 0
  },
  {
    id: 3,
    title: "Design an Orders Table",
    question: "Create a table to track customer orders.",
    type: "schema_design",
    requirements: [
      "Table should be named 'orders'",
      "Include order_id as PRIMARY KEY",
      "Include customer_id (INTEGER, NOT NULL)",
      "Include order_date (DATE, NOT NULL)",
      "Include total_amount (DECIMAL, NOT NULL)",
      "Include status (VARCHAR, NOT NULL)",
      "status should have possible values: 'pending', 'shipped', 'delivered', 'cancelled'"
    ],
    solved: 0
  }
];

export default playgroundQuestions;