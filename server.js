require("dotenv").config();
const app = require("./bin/app");
const jobs = require("./jobs");

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App Running On : http://localhost:${port}`);
  jobs()
});
