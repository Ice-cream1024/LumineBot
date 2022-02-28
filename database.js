var mysql = require("mysql");                   //mysql包，存放数据
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
				conn.release();                 //释放连接 
				callback(qerr, vals, fields);   //事件驱动回调 
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
				conn.release();                 //释放连接 
				callback(qerr, vals, fields);   //事件驱动回调 
			});
		}
	});
};
exports.query = query;
exports.query_noparam = query_noparam;