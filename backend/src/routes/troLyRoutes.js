const express = require('express');
const router = express.Router();

const { hoiTroLy, layLichSu, xoaLichSu } = require('../controllers/troLyController');
const { protect, docNguoiDungNeuCo } = require('../middlewares/authMiddleware');

// `/hoi` dung `docNguoiDungNeuCo` chu khong phai `protect`, vi hop chat noi o
// goc phai hien tren MOI trang cua portal - ke ca trang chu, noi phan lon nguoi
// xem chua dang nhap. Chan dang nhap o day thi cai nut do gan nhu vo dung.
//
// Doi lai, controller phai tu phan biet hai che do: hoi chung thi ai cung hoi
// duoc (han muc dem theo IP), con hoi VE MOT BAI HOC thi bat buoc dang nhap va
// phai qua cong kiem quyen - vi luc do noi dung bai duoc dua vao loi nhac.
router.post('/hoi', docNguoiDungNeuCo, hoiTroLy);

router
    .route('/lich-su')
    .get(protect, layLichSu)
    .delete(protect, xoaLichSu);

module.exports = router;
