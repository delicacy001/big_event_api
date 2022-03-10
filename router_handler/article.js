// 导入数据库操作模块
const { timingSafeEqual } = require('crypto')
    // 导入处理路径的 path 核心模块
const path = require('path')
const db = require('../db/index')
    // 发布新文章的处理函数
exports.addArticle = (req, res) => {
    // 手动判断是否上传了文章封面
    if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必选参数！')

    // TODO：表单数据合法，继续后面的处理流程...
    // 导入处理路径的 path 核心模块
    const path = require('path')

    const articleInfo = {
        // 标题、内容、状态、所属的分类Id
        ...req.body,
        // 文章封面在服务器端的存放路径
        cover_img: path.join('/uploads', req.file.filename),
        // 文章发布时间
        pub_date: new Date(),
        // 文章作者的Id
        author_id: req.user.id,
    }
    const sql = `insert into ev_articles set ?`


    // 执行 SQL 语句
    db.query(sql, articleInfo, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)

        // 执行 SQL 语句成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('发布文章失败！')

        // 发布文章成功
        res.cc('发布文章成功', 0)
    })

}
exports.getArticleList = (req, res) => {
        var total = 0;
        var sql = '';
        var firstSignal = false;
        var cateId = req.query.cate_id;
        var pagenum = parseInt(req.query.pagenum);
        var pagesize = parseInt(req.query.pagesize);
        var state = req.query.state;
        if (cateId == '' && state == '') {
            sql = 'SELECT Id,title,pub_date,state,cate_name FROM (SELECT ev_articles.Id as Id,title,pub_date,state,name as cate_name,cate_id,ev_articles.is_delete FROM ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id) as a order by pub_date'
            if (pagenum == 1 && pagesize == 8) {
                firstSignal = true;
            }
        }
        if (cateId !== '' && state == '') {
            sql = 'SELECT Id,title,pub_date,state,cate_name FROM (SELECT ev_articles.Id as Id,title,pub_date,state,name as cate_name,cate_id,ev_articles.is_delete FROM ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id) as a where cate_id=' + cateId + ' order by pub_date'
        }
        if (cateId == '' && state !== '') {
            sql = 'SELECT Id,title,pub_date,state,cate_name FROM (SELECT ev_articles.Id as Id,title,pub_date,state,name as cate_name,cate_id,ev_articles.is_delete FROM ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id) as a where state="' + state + '" order by pub_date'
        }
        if (cateId !== '' && state !== '') {
            sql = 'SELECT Id,title,pub_date,state,cate_name FROM (SELECT ev_articles.Id as Id,title,pub_date,state,name as cate_name,cate_id,ev_articles.is_delete FROM ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id) as a where state="' + state + '" and cate_id=' + cateId + ' order by pub_date'
        }
        db.query(sql, (err, results) => {
            if (err) return res.cc(err);
            total = results.length;
            let start = 0;
            let end = 0;
            let lastBegin = 0;
            if (total % pagesize == 0) {
                lastBegin = total - pagesize;
            } else {
                lastBegin = total - (total % pagesize);
            }
            if (pagenum == total / pagesize) {
                start = lastBegin;
                end = total - lastBegin;
            } else {
                start = (pagenum - 1) * pagesize;
                end = pagesize;
            }
            //首次刷新，默认显示最后一页
            if (firstSignal) {
                start = lastBegin;
                end = total % pagesize == 0 ? pagesize : (total % pagesize);
            }
            var area = []
            results.forEach((item, index) => {
                if (index >= (start) && index <= (start + end - 1)) {
                    area.push(item);
                }
            })
            res.send({
                status: 0,
                message: "获取文章列表成功！",
                data: area,
                total: total
            });
        })
    }
    //删除文章数据的处理方法
exports.deleteArticle = (req, res) => {
        let id = req.params.id;
        let sql = 'update ev_articles set is_delete=1 where Id=' + id;
        // 执行 SQL 语句
        db.query(sql, (err, results) => {
            // 执行 SQL 语句失败
            if (err) return res.cc(err)

            // 执行 SQL 语句成功，但是影响行数不等于 1
            if (results.affectedRows !== 1) return res.cc('删除文章失败！')

            // 发布文章成功
            res.cc('删除文章成功', 0)
        })

    }
    //获取文章详情的处理方法
exports.getArticle = (req, res) => {
        let id = req.params.id;
        let sql = 'select * from ev_articles where Id=' + id;
        // 执行 SQL 语句
        db.query(sql, (err, results) => {
            // 执行 SQL 语句失败
            if (err) return res.cc(err)

            // 执行 SQL 语句成功，但是影响行数不等于 1
            if (results.length < 1) return res.cc('获取文章信息失败！')

            // 获取文章信息成功
            // res.cc('获取文章信息成功', 0)
            res.send({
                status: 0,
                message: "获取文章信息成功！",
                data: results
            });
        })

    }
    // 编辑文章的处理函数
exports.editArticle = (req, res) => {
    // 文件
    //   console.log(req.files);
    //   // 键值对
    //   console.log(req.fields);
    // 手动判断是否上传了文章封面
    // if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必选参数！')
    // let id = parseInt(req.fields.Id);
    let id = parseInt(req.body.Id);
    let articleInfo = {
        ...req.body,
        // 文章封面在服务器端的存放路径
        // cover_img: req.files['cover_img2'].path,
        cover_img: path.join('/uploads', req.file.filename),
        // 文章发布时间
        pub_date: new Date(),
        // 文章作者的Id
        author_id: req.user.id,
    };
    delete articleInfo.Id;

    // res.send({
    //     status: 0,
    //     message: '自己好好看看写的是啥！！！',
    //     data: articleInfo.cover_img
    // });
    const sql = `update ev_articles set ? where Id=?`
        // 执行 SQL 语句
    db.query(sql, [articleInfo, id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)

        // 执行 SQL 语句成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('修改文章失败！')

        // 发布文章成功
        res.cc('修改文章成功', 0)
    })

}