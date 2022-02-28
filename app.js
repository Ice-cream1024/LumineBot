'use strict';
const ws = require('ws');
const fs = require('fs');
const database = require('./database.js');
const gift_gacha = require('./gift_gacha.js');
const foods = require('./what_to_eat.js').foods;

const GiftPool = gift_gacha.pool;
const GiftPossibilityCount = gift_gacha.count;

//const exec = require('child_process').exec;

let getpoked = 0;

let eroCount = {};
let talkCount = {};

setInterval(function() {
	if (getpoked > 0) getpoked -= 1;
}, 30000);

function RandIntUniform(min /* inclusive */, max /* exclusive */, initv) {
	let len = max - min;
	return (Math.floor(Math.random() * len) + initv) % len + min;
}

const reply = JSON.parse(fs.readFileSync("Lumine.json", { encoding: "utf8" }));

function WhatToEat(data) {
	let rank = Math.floor(RandIntUniform(0, foods.length, Math.random()));
	let food = foods[rank].split(".")[0];
	let content = JSON.stringify({
		action: "send_group_msg",
		params: {
			message_type: "group",
			group_id: data.group_id,
			message: `[CQ:image,file=whattoeat/foods/${food}.jpg] [CQ:at,qq=${data.user_id}] 去吃${food}怎么样？`
		}
	});
	wsClient.send(content, function (err) {
		if (err) {
			console.error(err);
			return;
		}
	});
}

function ERRContent(group_id) {
	return JSON.stringify({
		action: "send_group_msg",
		params: {
			message_type: "group",
			group_id: group_id,
			message: "荧开小差了，稍后再试试……"
		}
	});
}

function GetLikeReplyContent(favorability) {
	for (let i in reply.favor) {
		for (let j in reply.favor[i].favorRange) {
			if (favorability >= reply.favor[i].favorRange[j].beg && favorability < reply.favor[i].favorRange[j].end) {
				return reply.favor[i].reply[Math.floor(Math.random() * reply.favor[i].reply.length)];
			}
		}
	}
}

function GetReplyContent(condi) {
	let hour = new Date().getHours();
	for (let i in reply[condi]) {
		for (let j in reply[condi][i].timeRange) {
			if (hour >= reply[condi][i].timeRange[j].beg && hour < reply[condi][i].timeRange[j].end) {
				return reply[condi][i].reply[Math.floor(Math.random() * reply[condi][i].reply.length)];
			}
		}
	}
	return null;
}

function SendReply(data, condi, isAt) {
	let replyContent = GetReplyContent(condi);
	if (!replyContent) {
		return;
	}

	if (isAt) {
		replyContent = `[CQ:at,qq=${data.user_id}] ` + replyContent;
	}

	let content = JSON.stringify({
		action: "send_group_msg",
		params: {
			message_type: "group",
			group_id: data.group_id,
			message: replyContent
		}
	});
	wsClient.send(content, function (err) {
		if (err) {
			console.error(err);
			return;
		}
	});
}


const wsClient = new ws("ws://localhost:6700/");

function messageEventDetect(events, isAt, message) {
	if (isAt && message.indexOf("[CQ:at,qq=3627936828]") == -1) {
		return false;
	}
	for (let i in events) {
		switch (typeof (events[i])) {
			case "string":
				if (message.indexOf(events[i]) != -1) return true;
				break;
			case "object":
				let flag = true;
				for (let j in events[i]) {
					if (message.indexOf(events[i][j]) != -1) {
						flag = false;
						break;
					}
				}
				if(flag) return true;
				break;
			default:
				console.error("Illegal event type: " + typeof(events[i]));
				return
		}
	}
	return false;
}

function queryDatabaseByID(user_id, group_id, initial_callback, callback) {
	database.query("SELECT * FROM users WHERE id = ?;", [user_id], function (qerr, rows, fields) {
		if (qerr || !rows) {
			console.error(qerr);
			wsClient.send(ERRContent(group_id), function (err) {
				if (err) {
					console.error(err);
					return;
				}
			});
			return;
		}
		if (initial_callback && rows.length == 0) {
			database.query("INSERT INTO users (id, total, conti, last, favorability) VALUES (?, 1, 1, ?, 100);",
				[user_id, Date.now()],
			function(qerr1, rows1, fields1) {
				if (qerr1) {
					console.error(qerr1);
					wsClient.send(ERRContent(group_id), function (err) {
						if (err) {
							console.error(err);
							return;
						}
					});
					return;
				}
				initial_callback();
			});
		} else {
			callback(rows);
		}
	});
}

function HandleGroupMessage(data) {
	if (data.user_id == 3627936828) return;

	talkCount[data.user_id] = 1 + (talkCount[data.user_id] || 0);
	if (talkCount[data.user_id] >= 100) {
		talkCount[data.user_id] -= 100;

	}

	if (messageEventDetect(["超我", "炒我", "超蓝", "上我", "超市我", "超死我", "涩涩", "色色", "超荧", "炒荧", "炒你", "超你", "超市你", "超死你", "橄榄", "超市荧", "超死荧"], true, data.message)) {
		eroCount[data.user_id] = 1 + (eroCount[data.user_id] || 0);
		let content = JSON.stringify({
			action: "send_group_msg",
			params: {
				message_type: "group",
				group_id: data.group_id,
				message: `[CQ:image,file=angry.jpg] 不可以涩涩！`
			}
		});
		wsClient.send(content, function (err) {
			if (err) {
				console.error(err);
				return;
			}
			//console.log("警告");
			setTimeout(function () {
				let content1 = JSON.stringify({
					action: "set_group_ban",
					params: {
						user_id: data.user_id,
						group_id: data.group_id,
						duration: eroCount[data.user_id] % 10 == 0 ? 300 : 60
					}
				});
				wsClient.send(content1, function (err) {
					if (err) {
						console.error(err);
						return;
					}
					//console.log("禁言");
				});
				if(eroCount[data.user_id] % 10 == 0) {
					let ero_cb = function() {
						database.query(`UPDATE users SET favorability = favorability - 5 WHERE id = ?;`,
							[data.user_id],
						function(qerr1, rows1, field1) {
							if (qerr1) {
								console.error(qerr1);
								wsClient.send(ERRContent(data.group_id), function (err) {
									if (err) {
										console.error(err);
										return;
									}
								});
								return;
							}
							let content = JSON.stringify({
								action: "send_group_msg",
								params: {
									message_type: "group",
									group_id: data.group_id,
									message: `[CQ:at,qq=${data.user_id}]你今天已经冲得太多了，休息一下吧（好感度-5）`
								}
							});
							wsClient.send(content, function (err) {
								if (err) {
									console.error(err);
									return;
								}
							});
						});
					};
					queryDatabaseByID(data.user_id, data.group_id, null, function(rows) {
						ero_cb();
					});
				}
			}, 500);
		});
	} else if (messageEventDetect(["汪汪"], false, data.message)) {
		let content = JSON.stringify({
			action: "send_group_msg",
			params: {
				message_type: "group",
				group_id: data.group_id,
				message: "[CQ:image,file=whisper.jpg]【悄咪咪】她是不是脑子冲坏了啊？"
			}
		});
		wsClient.send(content, function (err) {
			if (err) {
				console.error(err);
				return;
			}
		});
	} else if (messageEventDetect(["和你睡", "跟你睡", "和我睡", "跟我睡", "一起睡"], true, data.message)) {
		let content = JSON.stringify({
			action: "send_group_msg",
			params: {
				message_type: "group",
				group_id: data.group_id,
				message: "好呀，好孩子就要睡够八个小时才可以呢！"
			}
		});
		wsClient.send(content, function (err) {
			if (err) {
				console.error(err);
				return;
			}
			setTimeout(function () {
				let content1 = JSON.stringify({
					action: "set_group_ban",
					params: {
						user_id: data.user_id,
						group_id: data.group_id,
						duration: 8 * 60 * 60
					}
				});
				wsClient.send(content1, function (err) {
					if (err) {
						console.error(err);
						return;
					}
					//console.log("禁言");
				});
			}, 500);
		});
	} else if (messageEventDetect(["心里有我"], false, data.message)) {
		let content = JSON.stringify({
			action: "send_group_msg",
			params: {
				message_type: "group",
				group_id: data.group_id,
				message: "[CQ:image,file=ding.jpg]"
			}
		});
		wsClient.send(content, function (err) {
			if (err) {
				console.error(err);
				return;
			}
		});
	} else if (messageEventDetect(["吃什么"], true, data.message)) {
		WhatToEat(data);
	}
	else if (messageEventDetect(["聊天"], true, data.message)) {
		SendReply(data, "chating", true);
	} else if (messageEventDetect(["晚安", "晚好", "晚上好"], true, data.message)) {	//晚安功能
		SendReply(data, "night", true);
	} else if (messageEventDetect(["早安", "早上好"], true, data.message)) {			//早安功能
		SendReply(data, "morning", true);
	} else if (messageEventDetect(["中午好", "午安", "下午好"], true, data.message)) {
		SendReply(data, "noon", true);
	} else if (messageEventDetect(["没钱了", "穷了"], false, data.message)) {
		SendReply(data, "comfort_2", true);
	} else if (messageEventDetect(["吃荧", "吃你", "吃了你"], true, data.message)) {
		SendReply(data, "eat", true);
	}else if (messageEventDetect(["指南"], true, data.message)) {
		SendReply(data, "reference", true);
	} else if (messageEventDetect(["骂我", "荧荧的狗", "你的狗"], true, data.message)) {
		SendReply(data, "action2", true);
	} else if (messageEventDetect(["贴贴"], true, data.message)) {
		SendReply(data, "action3", true);
	} else if (messageEventDetect(["亲亲", "嘴一个", "来睡觉"], true, data.message)) {
		SendReply(data, "action", true);
	} else if (messageEventDetect(["老婆", "宝贝", "亲爱的"], true, data.message)) {
		SendReply(data, "salutation1", true);
	}  else if (messageEventDetect(["妹妹"], true, data.message)) {
		SendReply(data, "salutation2", true);
	} else if (messageEventDetect(["喜欢你", "爱你"], true, data.message)) {
		SendReply(data, "mylove", true);
	} else if (messageEventDetect(["安慰", "伤心", "不开心", "不高兴"], false, data.message)) {
		SendReply(data, "comfort", true);
	} else if (messageEventDetect(["高兴", "开心"], false, data.message)) {
		SendReply(data, "happiness", true);
	} else if (messageEventDetect(["歪了"], false, data.message)) {
		SendReply(data, "comfort_1", true);
	} else if (messageEventDetect(["好玩", "推荐"], false, data.message) && messageEventDetect(["游戏", "手游", "APP", "app", "App"], false, data.message)) {
		SendReply(data, "game", true);
	} else if (messageEventDetect(["荧荧荧荧"], false, data.message)) {
		let content = JSON.stringify({
			action: "send_group_msg",
			params: {
				message_type: "group",
				group_id: data.group_id,
				message: "[CQ:image,file=sigh.jpg]好啦好啦我听到了，真拿你没办法"
			}
		});
		wsClient.send(content, function (err) {
			if (err) {
				console.error(err);
				return;
			}
		});
	} else if (messageEventDetect(["荧荧"], true, data.message)) {
		SendReply(data, "call_1", true);
	} else if (messageEventDetect(["签到"], true, data.message)) {
		queryDatabaseByID(data.user_id, data.group_id, function() {
			let content = JSON.stringify({
				action: "send_group_msg",
				params: {
					message_type: "group",
					group_id: data.group_id,
					message: `[CQ:at,qq=${data.user_id}] 签到成功！你连续签到了1天，总共签到了1天！`
				}
			});
			wsClient.send(content, function (err) {
				if (err) {
					console.error(err);
					return;
				}
			});
		}, function(rows) {
			let lastDate = new Date(rows[0].last);
			let nextDate = new Date(rows[0].last + 24 * 60 * 60 * 1000);
			let nowDate = new Date();
			let totalCount = rows[0].total + 1;
			let totalAdd = ((totalCount % 7 == 0 || totalCount % 30 == 0) ? 10 : 0) + ((totalCount % 365 == 0) ? 50 : 0);
			if(lastDate.getFullYear() == nowDate.getFullYear() &&
			   lastDate.getMonth() == nowDate.getMonth() &&
			   lastDate.getDate() == nowDate.getDate()) {
				let content = JSON.stringify({
					action: "send_group_msg",
					params: {
						message_type: "group",
						group_id: data.group_id,
						message: `[CQ:at,qq=${data.user_id}] 这么快就想我了吗？我们今天刚刚见过面呀~`
					}
				});
				wsClient.send(content, function (err) {
					if (err) {
						console.error(err);
						return;
					}
				});
			} else if (nextDate.getFullYear() == nowDate.getFullYear() &&
					   nextDate.getMonth() == nowDate.getMonth() &&
					   nextDate.getDate() == nowDate.getDate()) {
				database.query(`UPDATE users SET total = total + 1, conti = conti + 1, last = ?, favorability = favorability + ?, gifts = gifts + 10 WHERE id = ?;`,
					[nowDate.valueOf(), totalAdd, data.user_id],
				function(qerr1, rows1, field1) {
					if (qerr1) {
						console.error(qerr1);
						wsClient.send(ERRContent(data.group_id), function (err) {
							if (err) {
								console.error(err);
								return;
							}
						});
						return;
					}
					
					let content = JSON.stringify({
						action: "send_group_msg",
						params: {
							message_type: "group",
							group_id: data.group_id,
							message: `[CQ:at,qq=${data.user_id}] 签到成功！今天是我们踏上旅途的第${rows[0].conti + 1}天，我们一共度过了${rows[0].total + 1}天。${totalAdd == 0 ? "" : `（因为你的长时间陪伴，荧对你的好感度增加了${totalAdd}）`}未知的世界，新奇的见闻等待着我们发现。今后希望你也能和我一起前行，我会陪着你直至旅途的终点。`
						}
					});
					wsClient.send(content, function (err) {
						if (err) {
							console.error(err);
							return;
						}
					});
				});
			} else {
				database.query(`UPDATE users SET total = total + 1, conti = 1, last = ?, favorability = favorability + ?, gifts = gifts + 10 WHERE id = ?;`,
					[nowDate.valueOf(), totalAdd, data.user_id],
				function (qerr1, rows1, field1) {
					if (qerr1) {
						console.error(qerr1);
						wsClient.send(ERRContent(data.group_id), function (err) {
							if (err) {
								console.error(err);
								return;
							}
						});
						return;
					}
					let content = JSON.stringify({
						action: "send_group_msg",
						params: {
							message_type: "group",
							group_id: data.group_id,
							message: `[CQ:at,qq=${data.user_id}] 签到成功！又见面了！今天是我们一起旅行的第1天，我们一共已经一起旅行${rows[0].total + 1}天了噢。${totalAdd == 0 ? "" : `（因为你的长时间陪伴，荧对你的好感度增加了${totalAdd}）`}嗯……那几天没来见我的日子，你在陪伴谁呢？`
						}
					});
					wsClient.send(content, function (err) {
						if (err) {
							console.error(err);
							return;
						}
					});
				});
			}
		});
	} else if (messageEventDetect(["投喂", "送礼"], true, data.message)) {
		let it = RandIntUniform(0, GiftPossibilityCount, Math.random());
		let gsum = 0;
		for (let gindex in GiftPool) {
			gsum += GiftPool[gindex].possibility;
			if (it < gsum) {
				let feed_cb = function() {
					database.query(`UPDATE users SET favorability = favorability + ? WHERE id = ?;`,
						[GiftPool[gindex].add, data.user_id],
					function(qerr1, rows1, field1) {
						if (qerr1) {
							console.error(qerr1);
							wsClient.send(ERRContent(data.group_id), function (err) {
								if (err) {
									console.error(err);
									return;
								}
							});
							return;
						}
						let effect = GiftPool[gindex].add < 0 ? "减少" : "增加";
						let content = JSON.stringify({
							action: "send_group_msg",
							params: {
								message_type: "group",
								group_id: data.group_id,
								message: `[CQ:at,qq=${data.user_id}] 投喂了${GiftPool[gindex].item}×1，好感度${effect}了${Math.abs(GiftPool[gindex].add)}。${GiftPool[gindex].reaction}`
							}
						});
						wsClient.send(content, function (err) {
							if (err) {
								console.error(err);
								return;
							}
						});
					});
				}
				queryDatabaseByID(data.user_id, data.group_id, null, function(rows) {
					feed_cb();
				});
				break;
			}
		}
	} else if(messageEventDetect(["多喜欢我"], true, data.message)) {
		queryDatabaseByID(data.user_id, data.group_id, null, function(rows) {
			let content = JSON.stringify({
				action: "send_group_msg",
				params: {
					message_type: "group",
					group_id: data.group_id,
					message: rows.length == 0 ? "【荧还不认识你，签到试试吧。】" : `[CQ:at,qq=${data.user_id}] 荧对你的好感度是${rows[0].favorability}。${GetLikeReplyContent(rows[0].favorability)}`
				}
			});
			wsClient.send(content, function (err) {
				if (err) {
					console.error(err);
					return;
				}
			});
		});
	}
}

function HandleNotify(data) {
	if (data.sub_type == "poke" && data.target_id == 3627936828 && data.group_id) {
		if (getpoked < 6) {
			getpoked += 1;
		}
		if (getpoked < 5) {
			SendReply(data, "poke", true);
		} else {
			let content = JSON.stringify({
				action: "send_group_msg",
				params: {
					message_type: "group",
					group_id: data.group_id,
					message: `[CQ:poke,qq=${data.user_id}]`
				}
			});
			wsClient.send(content, function (err) {
				if (err) {
					console.error(err);
					return;
				}
			});
		}
	}
}

function HandleGroupIncrease(data) {
	let content = JSON.stringify({
		action: "send_group_msg",
		params: {
			message_type: "group",
			group_id: data.group_id,
			message: `[CQ:at,qq=${data.user_id}] 嗯……？你是要和我一起旅行吗？……我们的路途会很危险，也许，甚至可能没有终点。但是你放心，无论发生什么，我都会保护好你。`
		}
	});
	wsClient.send(content, function (err) {
		if (err) {
			console.error(err);
			return;
		}
	});
}

wsClient.onmessage = function (event) {
	let data = JSON.parse(event.data);
	if (!data.post_type) return;
	switch (data.post_type) {
		case "message":
			console.log(data);
			if (data.message_type && data.message_type == "group") {
				HandleGroupMessage(data);
			}
			break;
		case "notice":
			console.log(data);
			if(!data.notice_type) return;
			switch (data.notice_type) {
				case "group_increase":
					HandleGroupIncrease(data);
					break;
				case "notify":
					HandleNotify(data);
					break;
				default:
					break;
			}
			break;
	}
}