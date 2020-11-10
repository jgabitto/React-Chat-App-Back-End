const server = require("./app");

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
