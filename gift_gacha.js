'use strict';

const GiftPool = [
	{ item: "派蒙", reaction: "派蒙是应急食品，现在还不可以吃。", possibility: 2, add: -20 },
	{ item: "荧的色图", reaction: "[CQ:image,file=hentai.jpg]变态！", possibility: 2, add: -20 },
	{ item: "《群友发疯实录》", reaction: "[CQ:image,file=scared.jpg]", possibility: 3, add: -15 },
	{ item: "史莱姆凝液滑蘑菇", reaction: "这是香菱研发的新菜品？……可是感觉史莱姆还在动……", possibility: 3, add: -10 },
	{ item: "雷神亲手做的料理", reaction: "[CQ:image,file=fear.jpg]这……雷神做的料理，吃了会死吧……", possibility: 3, add: -5 },
	{ item: "史莱姆凝液", reaction: "", possibility: 3, add: -5 },
	{ item: "奇怪的料理", reaction: "", possibility: 3, add: -5 },
	{ item: "电动轮椅", reaction: "电动轮椅？好奇怪的东西，还是离远点比较好……", possibility: 2, add: -20 },
	{ item: "日落果", reaction: "普通的日落果，口感很香甜。", possibility: 3, add: 5 },
	{ item: "小灯草", reaction: "", possibility: 3, add: 5 },
	{ item: "苹果", reaction: "普通的苹果，口感很清脆。", possibility: 3, add: 5 },
	{ item: "禽肉", reaction: "", possibility: 3, add: 5 },
	{ item: "烤兽肉", reaction: "", possibility: 3, add: 5 },
	{ item: "普通的煎蛋", reaction: "", possibility: 3, add: 5 },
	{ item: "万民堂新菜品", reaction: "", possibility: 3, add: 10 },
	{ item: "甜甜花酿鸡", reaction: "", possibility: 3, add: 10 },
	{ item: "杏仁豆腐", reaction: "", possibility: 3, add: 15 },
	{ item: "霓裳花", reaction: "", possibility: 3, add: 15 },
	{ item: "琉璃百合", reaction: "", possibility: 3, add: 15 },
	{ item: "风车菊", reaction: "", possibility: 3, add: 15 },
	{ item: "塞西莉亚花", reaction: "", possibility: 3, add: 15 },
	{ item: "冰史莱姆", reaction: "", possibility: 3, add: 15 },
	{ item: "相遇之缘", reaction: "", possibility: 2, add: 20 },
	{ item: "摩拉", reaction: "[CQ:image,file=mora.jpg]是摩拉~谢谢你！", possibility: 2, add: 20 },
	{ item: "纠缠之缘", reaction: "这个，拿到手很不容易吧？……你还花了钱吗？你能送我这种我当然很开心，但是相比之下我更希望你先关心和照顾好自己。如果你不先好好照顾自己我会很难过的……不，没什么。总之，我很开心你这么喜欢我。", possibility: 2, add: 20 },
	{ item: "狗链", reaction: "你想让我用这个栓你吗？", possibility: 2, add: 20 },
	{ item: "至高的智慧", reaction: "偶尔吃吃沙拉也是不错的选择。（荧仔细端详这盘中的沙拉）嗯...整齐排开的翠绿色包菜叶、一分为二的苹果上堆叠着土豆泥、还有煎炸的刚刚好的煎蛋。虽然传统意义上的沙拉不会加入煎蛋，但是这样的沙拉倒是摩拉短缺的好选择!毕竟没有摩拉的时候饱腹就成了首要目的。味道很不错!这种口味的沙拉酱我还没有尝过呢，下次就麻烦你传授一下制作秘诀啦!", possibility: 2, add: 20 },
	{ item: "提瓦特焦蛋", reaction: "边缘略带焦感的煎蛋...欸？怎么开始低头叹气了？我并没有嫌弃它的意思，你看这样围了一圈焦边不是很像长裙的的裙摆吗？蛋黄居然是溏心的!唔...还有一点烫，煎出这样的蛋很麻烦吧？谢谢你，这是我吃过的最好吃的煎蛋。还剩下一半呢，我们一起吃吧。（荧将餐叉放入你的手中）", possibility: 2, add: 20 },
];


exports.pool = GiftPool;
exports.count = 60;

/*
let ans = 0;
for (let i = 0; i < GiftPool.length; ++i) {
	ans += GiftPool[i].possibility;
}
console.log(ans);
*/