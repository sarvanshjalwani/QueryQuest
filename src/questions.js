// questions.js
const questions = [
  {
    id: 1,
    title: "Select All Employees",
    question: "Write a query to fetch all columns from the employees table.",
    difficulty: "Easy",
    testCase: "Should return 5 rows.",
    expectedAnswer: "SELECT * FROM employees;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 2,
    title: "Filter by Department",
    question: "Find all employees working in the IT department.",
    difficulty: "Easy",
    testCase: "Should return Alice (75000) and Bob (65000).",
    expectedAnswer: "SELECT * FROM employees WHERE department = 'IT';",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 3,
    title: "Count Employees per Department",
    question: "Show department name and number of employees.",
    difficulty: "Easy",
    testCase: "IT→2, HR→2, Finance→1.",
    expectedAnswer: "SELECT department, COUNT(*) AS emp_count FROM employees GROUP BY department;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 4,
    title: "Find Highest Salary",
    question: "Get the name and salary of the highest-paid employee.",
    difficulty: "Easy",
    testCase: "Eve, 80000.",
    expectedAnswer: "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 1;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 5,
    title: "Average Salary by Department",
    question: "Calculate average salary for each department.",
    difficulty: "Easy",
    testCase: "IT→70000, HR→57500, Finance→80000.",
    expectedAnswer: "SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 6,
    title: "Employees Above Department Average",
    question: "Find employees whose salary is greater than their department's average salary.",
    difficulty: "Medium",
    testCase: "Alice and Diana.",
    expectedAnswer: "SELECT e.name, e.salary, e.department FROM employees e WHERE e.salary > (SELECT AVG(salary) FROM employees WHERE department = e.department);",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 7,
    title: "Top 2 Highest Order Amounts",
    question: "List the top 2 orders with the highest amount.",
    difficulty: "Medium",
    testCase: "450.00, 300.00.",
    expectedAnswer: "SELECT order_id, amount FROM orders ORDER BY amount DESC LIMIT 2;",
    databaseSchema: [
      `CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        amount REAL
      );`
    ],
    testData: [
      `INSERT INTO orders VALUES 
        (101, 1, '2024-01-10', 250.00),
        (102, 2, '2024-01-12', 450.00),
        (103, 1, '2024-02-15', 300.00),
        (104, 3, '2024-02-20', 125.00);`
    ],
    solved: 0
  },
  {
    id: 8,
    title: "Left Join Employees and Departments",
    question: "Show employee name and their department location.",
    difficulty: "Medium",
    testCase: "Alice→New York, Bob→New York, Charlie→Boston, Diana→Boston, Eve→Chicago.",
    expectedAnswer: "SELECT e.name, d.location FROM employees e LEFT JOIN departments d ON e.department = d.dept_name;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`,
      `CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT,
        location TEXT
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`,
      `INSERT INTO departments VALUES 
        (1, 'IT', 'New York'),
        (2, 'HR', 'Boston'),
        (3, 'Finance', 'Chicago');`
    ],
    solved: 0
  },
  {
    id: 9,
    title: "Running Total of Orders per Customer",
    question: "For each customer, show order_date, amount, and running total.",
    difficulty: "Medium",
    testCase: "Customer 1: 2024-01-10:250, running=250; 2024-02-15:300, running=550.",
    expectedAnswer: "SELECT customer_id, order_date, amount, SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total FROM orders;",
    databaseSchema: [
      `CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        amount REAL
      );`
    ],
    testData: [
      `INSERT INTO orders VALUES 
        (101, 1, '2024-01-10', 250.00),
        (102, 2, '2024-01-12', 450.00),
        (103, 1, '2024-02-15', 300.00),
        (104, 3, '2024-02-20', 125.00);`
    ],
    solved: 0
  },
  {
    id: 10,
    title: "Second Highest Salary",
    question: "Find the second highest salary from employees.",
    difficulty: "Medium",
    testCase: "75000 (Alice).",
    expectedAnswer: "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 11,
    title: "Dense Rank by Salary Within Department",
    question: "Rank employees by salary within their department using dense rank.",
    difficulty: "Hard",
    testCase: "IT: Alice(1), Bob(2); HR: Diana(1), Charlie(2); Finance: Eve(1).",
    expectedAnswer: "SELECT name, department, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank FROM employees;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 12,
    title: "Employees Hired Before Their Manager",
    question: "Find employees hired before their manager.",
    difficulty: "Hard",
    testCase: "Should return no rows (Bob hired after Alice, Charlie after Diana).",
    expectedAnswer: "SELECT e.name AS employee, e.hire_date AS emp_hire, m.name AS manager, m.hire_date AS mgr_hire FROM employees e JOIN employees m ON e.manager_id = m.emp_id WHERE e.hire_date < m.hire_date;",
    databaseSchema: [
      `CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        manager_id INTEGER
      );`
    ],
    testData: [
      `INSERT INTO employees VALUES 
        (1, 'Alice', 'IT', 75000, '2020-01-15', NULL),
        (2, 'Bob', 'IT', 65000, '2021-03-10', 1),
        (3, 'Charlie', 'HR', 55000, '2019-07-22', 4),
        (4, 'Diana', 'HR', 60000, '2018-11-01', NULL),
        (5, 'Eve', 'Finance', 80000, '2020-09-14', NULL);`
    ],
    solved: 0
  },
  {
    id: 13,
    title: "Product Revenue Above Category Average",
    question: "Find products whose total revenue is greater than the average revenue of their category.",
    difficulty: "Hard",
    testCase: "Laptop revenue=3600 > category avg 1925 → Yes. Mouse=250 → No. Desk=1050 → No.",
    expectedAnswer: "SELECT p.product_name, p.category, SUM(s.revenue) AS total_revenue FROM products p JOIN sales s ON p.product_id = s.product_id GROUP BY p.product_id HAVING SUM(s.revenue) > (SELECT AVG(cat_rev) FROM (SELECT SUM(s2.revenue) AS cat_rev FROM sales s2 JOIN products p2 ON s2.product_id = p2.product_id WHERE p2.category = p.category GROUP BY p2.product_id) AS cat_avg);",
    databaseSchema: [
      `CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT,
        category TEXT,
        price REAL
      );`,
      `CREATE TABLE sales (
        sale_id INTEGER PRIMARY KEY,
        product_id INTEGER,
        sale_date TEXT,
        quantity INTEGER,
        revenue REAL
      );`
    ],
    testData: [
      `INSERT INTO products VALUES 
        (1, 'Laptop', 'Electronics', 1200.00),
        (2, 'Mouse', 'Electronics', 25.00),
        (3, 'Desk', 'Furniture', 350.00);`,
      `INSERT INTO sales VALUES 
        (1, 1, '2024-01-05', 2, 2400.00),
        (2, 2, '2024-01-10', 10, 250.00),
        (3, 1, '2024-02-01', 1, 1200.00),
        (4, 3, '2024-02-15', 3, 1050.00);`
    ],
    solved: 0
  },
  {
    id: 14,
    title: "Gap Between Consecutive Orders",
    question: "For each customer, find the gap (in days) between consecutive orders.",
    difficulty: "Hard",
    testCase: "Customer 1: between 2024-01-10 and 2024-02-15 → 36 days.",
    expectedAnswer: "SELECT customer_id, order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order_date, JULIANDAY(order_date) - JULIANDAY(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) AS days_gap FROM orders;",
    databaseSchema: [
      `CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        amount REAL
      );`
    ],
    testData: [
      `INSERT INTO orders VALUES 
        (101, 1, '2024-01-10', 250.00),
        (102, 2, '2024-01-12', 450.00),
        (103, 1, '2024-02-15', 300.00),
        (104, 3, '2024-02-20', 125.00);`
    ],
    solved: 0
  },
  {
    id: 15,
    title: "Monthly Sales Growth Rate",
    question: "Calculate month-over-month revenue growth percentage.",
    difficulty: "Hard",
    testCase: "Jan revenue=2650, Feb=2250, growth = (2250-2650)/2650 = -15.09%.",
    expectedAnswer: "WITH monthly AS (SELECT strftime('%Y-%m', sale_date) AS month, SUM(revenue) AS total_revenue FROM sales GROUP BY strftime('%Y-%m', sale_date)) SELECT month, total_revenue, LAG(total_revenue) OVER (ORDER BY month) AS prev_month_rev, ROUND(((total_revenue - LAG(total_revenue) OVER (ORDER BY month)) / LAG(total_revenue) OVER (ORDER BY month)) * 100, 2) AS growth_pct FROM monthly;",
    databaseSchema: [
      `CREATE TABLE sales (
        sale_id INTEGER PRIMARY KEY,
        product_id INTEGER,
        sale_date TEXT,
        quantity INTEGER,
        revenue REAL
      );`
    ],
    testData: [
      `INSERT INTO sales VALUES 
        (1, 1, '2024-01-05', 2, 2400.00),
        (2, 2, '2024-01-10', 10, 250.00),
        (3, 1, '2024-02-01', 1, 1200.00),
        (4, 3, '2024-02-15', 3, 1050.00);`
    ],
    solved: 0
  }
];

export default questions;