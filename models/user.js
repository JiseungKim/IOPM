const mysql = require("mysql2/promise");
const settings = require("../config/appsettings.local.json");

const sha256 = require("../modules/SHA256");
// 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class user {
  constructor() {
    this._pool = mysql.createPool(settings.database);
  }

  async update_last_login(mid) {
    let connection = null;

    try {
      connection = await this._pool.getConnection();

      await connection.query(
        `UPDATE user SET last_login=now() WHERE id=${mid}`
      );
    } catch (err) {
      throw err;
    } finally {
      connection?.release();
    }
  }

  async find(mid) {
    let connection = null;

    try {
      connection = await this._pool.getConnection();

      const [rows] = await connection.query(
        `SELECT * FROM user WHERE id=${mid}`
      );

      if (rows.length == 0) return null;

      return rows[0];
    } catch (err) {
      throw err;
    } finally {
      connection?.release();
    }
  }

  async find_all() {
    let connection = null;

    try {
      connection = await this._pool.getConnection();

      const [rows] = await connection.query(`SELECT * FROM user`);

      return rows;
    } catch (err) {
      throw err;
    } finally {
      connection?.release();
    }
  }

  assert(user, rows) {
    // TODO: 정규식!!
    const email_check = /([a-z0-9_\ .-]+)@([/da-z\ .-]+)\ .([a-z\ .]{2,6})/;

    for (let row of rows) {
      if (row.email == user.email) throw "중복된 이메일입니다.";
      if (row.nickname == user.nickname) throw "중복된 닉네임입니다.";
      if (row.phone == user.phone) throw "중복된 핸드폰번호입니다.";
    }
  }

  async add(user) {
    let connection = null;
    const code = sha256(user.password);

    try {
      connection = await this._pool.getConnection();

      const [rows] = await connection.query(
        `SELECT * FROM user
                WHERE email='${user.email}' OR nickname='${user.nickname}'`
      );

      for (let row of rows) {
        if (row.email == user.email) throw "중복된 이메일입니다.";
        if (row.nickname == user.nickname) throw "중복된 닉네임입니다.";
      }

      const [result] = await connection.query(
        `INSERT INTO user(email,password,nickname,phone,photo)
                VALUES('${user.email}','${code}','${user.nickname}','${user.phone}','${user.photo}')`
      );
      return result.insertId;
    } catch (err) {
      throw err;
    } finally {
      connection?.release();
    }
  }

  async update(user_id, user) {
    let connection = null;

    try {
      connection = await this._pool.getConnection();

      const [exists] = await connection.query(
        `SELECT COUNT(*) AS count FROM user
                WHERE NOT id='${user_id}' AND nickname='${user.nickname}'`
      );

      if (exists[0].count > 0) return null;

      const [result] = await connection.query(
        `UPDATE user SET
                nickname='${user.nickname}',photo='${user.photo}',phone='${user.phone}'
                WHERE id=${user_id}`
      );

      return result.affectedRows > 0;
    } catch (err) {
      throw err;
    } finally {
      connection?.release();
    }
  }

  async remove(mid) {
    let connection = null;

    try {
      connection = await this._pool.getConnection();

      const [result] = await connection.query(
        `DELETE FROM user WHERE id=${mid}`
      );

      return result.affectedRows > 0;
    } catch (err) {
      throw err;
    } finally {
      connection?.release();
    }
  }
}

module.exports = user;
