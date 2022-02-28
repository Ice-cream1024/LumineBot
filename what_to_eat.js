'use strict';

const fs = require('fs');

let foods = fs.readdirSync("../../go-cqhttp/data/images/whattoeat/foods/");

exports.foods = foods;