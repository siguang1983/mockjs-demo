# MockJS API 整理

## http://mockjs.com/examples.html

## 一、数据模板定义

	1、String

		1) "string|1-10": "★"		// 随机生成1-10个“★”字符串

		2) "string|3": "★★★"		// 输字几倍指定字符串的内容  "★★★★★★★★★"


	2、Number

		1）"number|+1": 202;

		2）"number|1-100": 100;		// 返回一个1-100的随机数

		3）"number|1-100.1-10": 1;	// 返回小数点后10的随机数  "number": 82.381299  1到100随机.1到10位随机

		4）"number|123.1-10": 1;		// 整数固定小数1到10位随机 "number": 123.32

		5) "number|123.3": 1;		// 整数固定小数随机生成3位 "number": 123.427

		6) "number|123.10": 1.123 	


	3、Boolan

		1) "boolean|1": true		// "boolean": true

		2) "boolean|1-2": true		// 随机返回true或false


	4、Object

		1）随机出两条数据

			Mock.mock({
				"object|2": {
					"310000": "上海市",
					"320000": "江苏省",
					"330000": "浙江省",
					"340000": "安徽省"
				}
			})

			输出
			object: {
				"310000": "上海市",
				"320000": "江苏省"
			}
	
		2) "object|2-4";	// 输出2-4条


	5、Array

		1）随机产生一条数据

			Mock.mock({
				"array|1": [
					"AMD",
					"CMD",
					"UMD"
				]
			})

		2）"array|+1": [...] 	// 按顺序一次产生一条数据

		3）"array|1-10": [ "Mock.js" ] 		// 随机出1至10条数据 ['Mock.js', 'Mock.js', 'Mock.js']

		4）"array|3": [ "Mock.js" ] 			// 输出固定3个"Mock.js"   ["Mock.js", "Mock.js", "Mock.js"]


	6、Function

		Mock.mock({
			'foo': 'Syntax Demo',
			'name': function() {
				return this.foo
			}
		})

		输出：
		{
			"foo": "Syntax Demo",
			"name": "Syntax Demo"
		}


	7、RegExp

		1) 'regexp': /[a-z][A-Z][0-9]/		// 输出 1个小写字母、1个大写字母、1个0-9任意字符

		'regexp': /\w{1,10}/ 	// 输出1-10个任意字符


	8、Path

		1) 绝对路径

			Mock.mock({
				"foo": "Hello",
				"nested": {
					"c": "Mock.js"
				},
				"absolutePath": "@/foo @/nested/a/b/c"		// 输出 Hello Mock.js
			})

		2、相对路径

			Mock.mock({
			  "foo": "Hello",
			  "nested": {
			     "a": "Mock.js"
			  },
			  "relativePath": {
			    "a": {
			        "b": "@../../foo @../../nested/a"		// 输出Hello Mock.js
			    }
			  }
			})


## 二、数据占位符定义

	var Random = Mock.Random;		// 需要调用先调用Random

	1、Random.boolean()  随机布尔值

		Random.boolean() 		// 定义随机布尔值
		Mock.mock('@boolean')	// 输出 true 或 false

	
	2、Random.natural( min?, max? )   随机整数

		Random.natural(10,100);  随机输出10到100之间的数据
		var numData = Mock.mock('@natural')

		Random.natural(60, 100)		
		Mock.mock({
			data: {
				num: numData
			}
		})
		
	3、Random.float() 随机生成浮点数

		Random.float()
		Mock.mock('@float')



Confluence 项目的wiki   http://www.unlimax.com/confluence.html

	用于一个项目创建一个空间，在内部进行分类，产品prd的修改，接口的管理，与JIRA的相关










