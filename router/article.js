// 导入 express
const express = require('express')
    // 创建路由对象
const router = express.Router()
    // 导入解析 formdata 格式表单数据的包
const multer = require('multer')
const multer2 = require('multer')
    //导入处理formdata数据的中间件
    // const formidable = require('express-formidable')
    // 导入处理路径的核心模块
const path = require('path')
    // 创建 multer 的实例对象，通过 dest 属性指定文件的存放路径
const upload = multer({ dest: path.join(__dirname, '../uploads') })
const upload2 = multer2({ dest: path.join(__dirname, '../uploads') })
    // 创建 multer 的实例对象，通过 dest 属性指定文件的存放路径
    // 导入文章的路由处理函数模块
const article_handler = require('../router_handler/article')
    // 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
    // 导入文章的验证模块
const { add_article_schema } = require('../schema/article')
    // 编辑文章的验证模块
    // 导入文章列表的验证模块
    // const { get_articleList_schema } = require('../schema/article')

// 发布新文章的路由
// upload.single() 是一个局部生效的中间件，用来解析 FormData 格式的表单数据
// 将文件类型的数据，解析并挂载到 req.file 属性中
// 将文本类型的数据，解析并挂载到 req.body 属性中
// 发布新文章的路由
// 注意：在当前的路由中，先后使用了两个中间件：
//       先使用 multer 解析表单数据
//       再使用 expressJoi 对解析的表单数据进行验证
router.post('/add', upload.single('cover_img'), expressJoi(add_article_schema), article_handler.addArticle)
    //路由中添加获取文章列表数据路由 , expressJoi(get_articleList_schema)
router.get('/list', article_handler.getArticleList)
    //添加根据id删除文章数据的路由
router.get('/delete/:id', article_handler.deleteArticle)
    //添加根据id获取文章详情的路由
router.get('/:id', article_handler.getArticle)
    //添加根据Id更新文章信息的路由
    // router.post('/edit', formidable('cover_img2'), article_handler.editArticle)
router.post('/edit', upload2.single('cover_img2'), article_handler.editArticle)
    // 向外共享路由对象
module.exports = router