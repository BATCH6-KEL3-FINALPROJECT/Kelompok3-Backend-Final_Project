const router = require('express').Router();

const Promotion = require("../controllers/PromotionController");

router.post('/create', Promotion.createPromotion); 
router.get('/', Promotion.getPromotion);
router.delete('/:id', Promotion.deletePromotion);



module.exports = router;