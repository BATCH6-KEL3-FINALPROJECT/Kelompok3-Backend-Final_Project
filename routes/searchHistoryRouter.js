const router = require('express').Router();

const SearchHistory = require("../controllers/searchHistory");
const authenticate = require("../middlewares/authenticate");

router.post('/create', authenticate, SearchHistory.createHistory);




module.exports = router;