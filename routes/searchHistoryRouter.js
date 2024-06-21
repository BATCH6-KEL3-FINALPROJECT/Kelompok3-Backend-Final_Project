const router = require('express').Router();

const SearchHistory = require("../controllers/searchHistory");
const authenticate = require("../middlewares/authenticate");

router.post('/create', authenticate, SearchHistory.createHistory);
router.get('/', authenticate, SearchHistory.getHistoryByUserToken);
router.delete('/delete/:id', authenticate, SearchHistory.deleteHistory);




module.exports = router;