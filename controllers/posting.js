// db 연결
const connection = require("../db/mysql_connection");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// @desc 게시글 작성(사진, 글)
// @route POST /api/v1/posting
// @request photo,body,tag
// @response success

// 클라이언트가 사진을 보낸다 => 서버가 이 사진을 받는다 => 서버가 디텍토리에 저장
// => 사진을 게시글의 글과 같이 작성
exports.postUpload = async (req, res, next) => {
  let user_id = req.user.id;
  //게시글 글, 사진 관련 입력값
  let body = req.body.body;
  let tag = req.body.tag;

  if (!user_id || !req.files) {
    res.status(400).json();
    return;
  }
  console.log(" ********* 폼 데이터 ***********", req.files, req.body);
  //   console.log(" ********* 바디 데이터 *********", body, tag);

  const photo = req.files.photo;
  // 지금 받은 파일이 이미지파일인지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지 파일이 아닙니다" });
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일크기가 정해진것보다 큽니다" });
    return;
  }
  // cat1.jpg => photo_2.jpg
  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;
  console.log(" ******************************** 포 토 네 임 **", photo.name);
  // 저장할 경로 셋팅 : ./public/upload/photo_1.jpg
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  // db에 이 게시글을 업로딩
  let query = `insert into sns_post (photo_url, body, tag, user_id) values ("${photo.name}","${body}","${tag}",${user_id});`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
};

// @desc 작성 게시글 불러오기
// @route get /api/v1/posting
// @request bearer
// @response success
exports.getPost = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `select * from sns_post where user_id = ${user_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
};

// @desc 작성 게시글 수정하기
// @route get /api/v1/posting/fix
// @request bearer, files, id, body, tag
// @response success
exports.fixPost = async (req, res, next) => {
  let user_id = req.user.id;
  //게시글 글, 사진 관련 입력값
  let id = req.body.id;
  let body = req.body.body;
  let tag = req.body.tag;

  if (!user_id || !req.files) {
    res.status(400).json();
    return;
  }

  const photo = req.files.photo;
  // 지금 받은 파일이 이미지파일인지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지 파일이 아닙니다" });
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일크기가 정해진것보다 큽니다" });
    return;
  }
  // cat1.jpg => photo_2.jpg
  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

  // 저장할 경로 셋팅 : ./public/upload/photo_1.jpg
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  // db에 이 게시글을 업로딩
  let query = `update sns_post set photo_url = "${photo.name}", body = "${body}", tag = "${tag}" where user_id = ${user_id} and id = ${id};`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
};

// @desc 작성 게시글 삭제하기
// @route delete /api/v1/posting/delete/
// @request bearer, id, files, body, tag
// @response success
exports.deletePost = async (req, res, next) => {
  let user_id = req.user.id;
  //게시글 글, 사진 관련 입력값
  let id = req.body.id;

  let query = `delete from sns_post where user_id = ${user_id} and id = ${id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
};
