import { StepAnimation, type Stage } from "@/components/blog/step-animation";

// Used in the "What happens inside PostgreSQL when you run a SELECT" post as
// <QueryJourney />. The snippets are simplified pictures of each stage's data,
// not literal Postgres output.
const stages: Stage[] = [
  {
    name: "Connection",
    flow: "SQL text → backend process",
    description:
      "Your client sends the SQL over an open connection. Postgres runs one backend process per connection, and that process receives the text and does all the work for it.",
    snippet: `Query message
  "SELECT id, total FROM orders WHERE customer_id = 42;"`,
  },
  {
    name: "Parser",
    flow: "SQL text → parse tree",
    description:
      "The parser checks grammar only. It doesn't know yet whether orders is a real table or whether customer_id exists, so a typo like SELEC fails here and a typo in a column name does not.",
    snippet: `SelectStmt
  targets: id, total
  from:    orders
  where:   customer_id = 42`,
  },
  {
    name: "Analyzer",
    flow: "parse tree → query tree",
    description:
      "Every name is looked up in the system catalogs and every type is resolved. A misspelled column fails here. The rewriter then expands views and adds row-level security filters.",
    snippet: `orders       -> public.orders (found in the catalogs)
customer_id  -> bigint column
customer_id = 42  -> bigint = bigint, valid`,
  },
  {
    name: "Planner",
    flow: "query tree → plan tree",
    description:
      "The planner uses table statistics to estimate how many rows match, prices the possible ways to fetch them, and picks the cheapest it finds.",
    snippet: `Seq Scan on orders                    cost 0.00..18334.00   rejected
Index Scan using orders_customer_id_idx  cost 0.43..12.50   chosen`,
  },
  {
    name: "Executor",
    flow: "plan tree → rows, one at a time",
    description:
      "The executor asks the top plan node for a row, which asks the node below it, down to the scan that reads the table. For each row version it also checks that you are allowed to see it.",
    snippet: `Index Scan   <- "next row, please"
  (1042, 59.90)
  (1187, 12.00)
  (1390, 240.50)`,
  },
  {
    name: "Buffers",
    flow: "page request → 8 KB page",
    description:
      "Every page goes through shared buffers. A hit is served from memory. A miss is read from the operating system, from its cache or from disk, and kept for next time.",
    snippet: `index page   -> hit
index page   -> hit
table page   -> hit
table page   -> miss, read from the OS
Buffers: shared hit=4 read=1`,
  },
  {
    name: "Result",
    flow: "rows → your client",
    description:
      "Rows are sent back as they are produced: a description of the columns, one message per row, then a completion message. Many client libraries still wait for all of them before handing you anything.",
    snippet: `RowDescription   id, total
DataRow          1042 | 59.90
DataRow          1187 | 12.00
DataRow          1390 | 240.50
CommandComplete  SELECT 3
ReadyForQuery`,
  },
];

export function QueryJourney() {
  return (
    <StepAnimation
      title="SELECT id, total FROM orders WHERE customer_id = 42;"
      stages={stages}
      note="Simplified: real Postgres has more internal steps."
    />
  );
}
