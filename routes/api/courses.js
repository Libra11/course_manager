// @login & register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const keys = require("../../config/keys");
const passport = require("passport");
const Teacher = require("../../models/Teacher");
const Course = require("../../models/Course");

const url = require("url");

// 增加单个课程
router.post(
  "/addcourse",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.body);
    const courseFields = {};
    if (req.body.pid) courseFields.pid = req.body.pid;
    if (req.body.name) courseFields.name = req.body.name;
    if (req.body.time) courseFields.time = req.body.time;
    if (req.body.tname) courseFields.tname = req.body.tname;
    if (req.body.num) courseFields.num = req.body.num;
    courseFields.lnum = req.body.num;
    if (req.body.info) courseFields.info = req.body.info;
    if (req.body.grade) courseFields.grade = req.body.grade;
    if (req.body.data) courseFields.data = req.body.data;
    new Course(courseFields).save().then((course) => {
      res.json(course);
    });
  }
);
// 获取课程名称和选课人数
router.get("/courseandpeople", (req, res) => {
  Course.find({}, { name: 1, num: 1, lnum: 1 }, (err, doc) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!doc) {
      return res.status(404).json("没有任何内容");
    } else {
      res.json({ data: doc });
    }
  });
});
// 获取所有课程
router.get(
  "/allcourses",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // 拿到参数
    const page_size = Number(url.parse(req.url, true).query.page_size);
    const page_index = Number(url.parse(req.url, true).query.page_index) - 1;
    const sort = url.parse(req.url, true).query.sort;
    const keyword = url.parse(req.url, true).query.keyword;
    const sortItem = url.parse(req.url, true).query.sortItem;
    // 模糊查询
    if (keyword == undefined || keyword == "") {
      var findFiler = {}; // 检索全部
    } else {
      // 使用正则表达式的构造函数将字符串转为再正则对象
      const regexp = new RegExp(keyword, "g");
      var findFiler = {
        $or: [
          { pid: regexp },
          { name: regexp },
          { tname: regexp },
          { info: regexp },
          { time: regexp },
        ],
      };
    }
    let sortNumber;
    if (sort == "ascending") {
      sortNumber = -1;
    } else if (sort == "descending") {
      sortNumber = 1;
    } else {
      sortNumber = -1;
    }

    // const sidx = url.parse(req.url, true).query.sidx;
    // const sord = url.parse(req.url, true).query.sord;
    // const keyword = url.parse(req.url, true).query.keyword;
    Course.countDocuments(findFiler, (err, count) => {
      const sortobj = {};
      sortobj[sortItem] = sortNumber;
      Course.find(findFiler)
        .sort(sortobj)
        .limit(page_size)
        .skip(page_size * page_index)
        .exec((err, course) => {
          if (!course) {
            return res.status(404).json("没有任何内容");
          }
          res.json({ total: count, data: course });
        });
    });
  }
);
// 获取某人课程
router.get(
  "/mycourses",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // 拿到参数
    const page_size = Number(url.parse(req.url, true).query.page_size);
    const page_index = Number(url.parse(req.url, true).query.page_index) - 1;
    const sort = url.parse(req.url, true).query.sort;
    const keyword = url.parse(req.url, true).query.keyword;
    const sortItem = url.parse(req.url, true).query.sortItem;
    // 模糊查询
    if (keyword == undefined || keyword == "") {
      var findFiler = {
        yibaoming: { $in: [url.parse(req.url, true).query.pid] },
      }; // 检索全部
    } else {
      // 使用正则表达式的构造函数将字符串转为再正则对象
      const regexp = new RegExp(keyword, "g");
      var findFiler = {
        $or: [
          { pid: regexp },
          { name: regexp },
          { tname: regexp },
          { info: regexp },
          { time: regexp },
        ],
      };
    }
    let sortNumber;
    if (sort == "ascending") {
      sortNumber = -1;
    } else if (sort == "descending") {
      sortNumber = 1;
    } else {
      sortNumber = -1;
    }

    // const sidx = url.parse(req.url, true).query.sidx;
    // const sord = url.parse(req.url, true).query.sord;
    // const keyword = url.parse(req.url, true).query.keyword;
    Course.countDocuments(findFiler, (err, count) => {
      const sortobj = {};
      sortobj[sortItem] = sortNumber;
      Course.find(findFiler)
        .sort(sortobj)
        .limit(page_size)
        .skip(page_size * page_index)
        .exec((err, course) => {
          console.log(course);
          if (!course) {
            return res.status(404).json("没有任何内容");
          }
          res.json({ total: count, data: course });
        });
    });
  }
);

// 更改教师
router.post(
  "/changeteacher",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const updatefileds = {};
    const _id = req.body._id;
    updatefileds.pid = req.body.pid;
    updatefileds.course = req.body.course;
    updatefileds.name = req.body.name;
    Teacher.findOneAndUpdate(
      { _id: _id },
      { $set: updatefileds },
      { new: true }
    ).then((teacher) => {
      res.json(teacher);
    });
  }
);
// 更改教师
router.post(
  "/changecourse",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let result = {};
    Course.findOne({ pid: req.body.pid }, (err, res2) => {
      result = res2;
      const courseFields = {};
      if (req.body.pid) courseFields.pid = req.body.pid;
      if (req.body.name) courseFields.name = req.body.name;
      if (req.body.time) courseFields.time = req.body.time;
      if (req.body.tname) courseFields.tname = req.body.tname;
      if (req.body.num) courseFields.num = req.body.num;
      courseFields.lnum = req.body.num - result.yibaoming.length;
      if (req.body.info) courseFields.info = req.body.info;
      if (req.body.grade) courseFields.grade = req.body.grade;
      if (req.body.data) courseFields.data = req.body.data;
      Course.findOneAndUpdate(
        { pid: req.body.pid },
        { $set: courseFields },
        { new: true }
      ).then((course) => {
        res.json(course);
      });
    });
  }
);

// 删除课程
router.delete(
  "/deletecou",
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Course.findOneAndRemove(
      { _id: url.parse(req.url, true).query._id },
      (err, course) => {
        if (err) {
          return res.status(404).json("删除失败!");
        }
        return res.status(200).json(course);
      }
    );
  }
);
// 选课
router.post(
  "/selectcou",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const updatefileds = {};
    const _id = req.body._id;
    const pid = req.body.pid;
    const length = req.body.length;
    Course.update(
      { _id: _id },
      { $addToSet: { yibaoming: pid } },
      (err, data) => {
        if (err) {
          console.log(err);
          return res.status(404).json("选课失败!");
        }
      }
    );
    Course.update({ _id: _id }, { lnum: length }, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(404).json("选课数量更新失败!");
      }
      return res.status(200).json(data);
    });
  }
);
module.exports = router;
