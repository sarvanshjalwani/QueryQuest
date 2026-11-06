import practiceQuestions from "./questions.js";

const sourceQuestions = new Map(practiceQuestions.map((question) => [question.id, question]));

const createCase = (id, sourceId, title, question, expectedAnswer, testCase) => {
  const source = sourceQuestions.get(sourceId);
  if (!source) {
    throw new Error(`Practice question ${sourceId} was not found for case ${id}.`);
  }

  return {
    ...source,
    id: `case-${id}`,
    title,
    question,
    expectedAnswer,
    testCase,
    solved: 0,
  };
};

const caseQuestions = [
  createCase(
    1,
    1,
    "The Finance Witness",
    "A witness says the person of interest works in Finance. Identify their name and salary.",
    "SELECT name, salary FROM employees WHERE department = 'Finance';",
    "Eve, salary 80000."
  ),
  createCase(
    2,
    1,
    "The Oldest Alibi",
    "Find the employee with the earliest hire date to verify the oldest alibi.",
    "SELECT name, hire_date FROM employees ORDER BY hire_date ASC LIMIT 1;",
    "Diana, hired 2018-11-01."
  ),
  createCase(
    3,
    1,
    "Unsupervised Access",
    "List the employees who have no manager recorded and may have had independent access.",
    "SELECT name FROM employees WHERE manager_id IS NULL ORDER BY name;",
    "Alice, Diana, and Eve."
  ),
  createCase(
    4,
    1,
    "The HR Witnesses",
    "The clue points to HR. List each HR employee and salary, highest salary first.",
    "SELECT name, salary FROM employees WHERE department = 'HR' ORDER BY salary DESC;",
    "Diana (60000), then Charlie (55000)."
  ),
  createCase(
    5,
    1,
    "The Anonymous Tip",
    "An anonymous tip identifies a suspect whose name begins with A. Find their name and hire date.",
    "SELECT name, hire_date FROM employees WHERE name LIKE 'A%';",
    "Alice, hired 2020-01-15."
  ),
  createCase(
    6,
    7,
    "The Repeat Buyer",
    "Find customers who placed more than one order, along with their order count.",
    "SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id HAVING COUNT(*) > 1;",
    "Customer 1 placed 2 orders."
  ),
  createCase(
    7,
    7,
    "The Underpriced Shipment",
    "The case file flags orders below the average order amount. Return each order ID and amount.",
    "SELECT order_id, amount FROM orders WHERE amount < (SELECT AVG(amount) FROM orders);",
    "Order 101: 250.00; order 104: 125.00."
  ),
  createCase(
    8,
    8,
    "Boston Alibis",
    "Cross-reference employees with their department locations and identify everyone based in Boston.",
    "SELECT e.name, d.location FROM employees e JOIN departments d ON e.department = d.dept_name WHERE d.location = 'Boston' ORDER BY e.name;",
    "Charlie and Diana are based in Boston."
  ),
  createCase(
    9,
    1,
    "The Salary Outlier",
    "Find employees whose salary is above the company-wide average. List the highest-paid first.",
    "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;",
    "Eve (80000) and Alice (75000)."
  ),
  createCase(
    10,
    15,
    "The Monthly Sales Ledger",
    "Summarize the sales evidence by month, showing each month and its total revenue.",
    "SELECT strftime('%Y-%m', sale_date) AS month, SUM(revenue) AS total_revenue FROM sales GROUP BY strftime('%Y-%m', sale_date) ORDER BY month;",
    "2024-01: 2650.00; 2024-02: 2250.00."
  ),
  createCase(
    11,
    13,
    "The Product Rankings",
    "Rank products by total revenue within each category to identify the leading product in every category.",
    "WITH product_revenue AS (SELECT p.product_name, p.category, SUM(s.revenue) AS total_revenue FROM products p JOIN sales s ON p.product_id = s.product_id GROUP BY p.product_id) SELECT product_name, category, total_revenue, RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC) AS category_rank FROM product_revenue;",
    "Laptop ranks 1 in Electronics; Mouse ranks 2; Desk ranks 1 in Furniture."
  ),
  createCase(
    12,
    7,
    "The Customer Timeline",
    "For every customer, reconstruct the first and last order dates and the number of days between them.",
    "SELECT customer_id, MIN(order_date) AS first_order, MAX(order_date) AS last_order, CAST(JULIANDAY(MAX(order_date)) - JULIANDAY(MIN(order_date)) AS INTEGER) AS days_between FROM orders GROUP BY customer_id;",
    "Customer 1's orders span 36 days; customers 2 and 3 each have a single order."
  ),
  createCase(
    13,
    13,
    "The Majority-Revenue Products",
    "Identify products responsible for more than half of the total revenue in their own category.",
    "SELECT p.product_name, p.category, SUM(s.revenue) AS total_revenue FROM products p JOIN sales s ON p.product_id = s.product_id GROUP BY p.product_id HAVING SUM(s.revenue) > (SELECT SUM(s2.revenue) * 0.5 FROM sales s2 JOIN products p2 ON s2.product_id = p2.product_id WHERE p2.category = p.category);",
    "Laptop contributes over half of Electronics revenue; Desk is all Furniture revenue."
  ),
  createCase(
    14,
    15,
    "The Cumulative Sales Trail",
    "Rebuild the sales trail in date order, showing each sale and cumulative revenue to that point.",
    "SELECT sale_date, revenue, SUM(revenue) OVER (ORDER BY sale_date, sale_id) AS running_revenue FROM sales ORDER BY sale_date, sale_id;",
    "The cumulative totals are 2400, 2650, 3850, and 4900."
  ),
  createCase(
    15,
    7,
    "The Biggest Order per Customer",
    "Rank each customer's orders from largest to smallest amount and include the order ID and amount.",
    "SELECT order_id, customer_id, amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS customer_rank FROM orders;",
    "Customer 1's order 103 ranks first (300.00), followed by order 101 (250.00)."
  ),
];

export default caseQuestions;
