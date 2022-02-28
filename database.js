var mysql = require("mysql");                   //mysql�����������
var pool = mysql.createPool({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'bot'
});
var query = function (sql, sqlparam, callback) {
	pool.getConnection(function (err, conn) {
		if (err) {
			callback(err, null, null);
		} else {
			conn.query(sql, sqlparam, function (qerr, vals, fields) {
				conn.release();                 //�ͷ����� 
				callback(qerr, vals, fields);   //�¼������ص� 
			});
		}
	});
};
var query_noparam = function (sql, callback) {
	pool.getConnection(function (err, conn) {
		if (err) {
			callback(err, null, null);
		} else {
			conn.query(sql, function (qerr, vals, fields) {
				conn.release();                 //�ͷ����� 
				callback(qerr, vals, fields);   //�¼������ص� 
			});
		}
	});
};
exports.query = query;
exports.query_noparam = query_noparam;