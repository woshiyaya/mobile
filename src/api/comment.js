import request from '@/utils/request.js'

/**
 * 获得"评论"列表
 * type 是 a或c 评论类型，a-对文章(article)的评论，c-对评论(comment)的回复
 * source:articleID 是  源id，文章id
 * offset 否  获取评论数据的【偏移量】，值为评论id，表示从此id的数据向后取，
 *            不传表示从第一页开始读取数据
 *            offset实现分页效果：
 *            offset=null       获得第1页数据，数据回来有一个last_id字段
 *            offset=last_id    获得第2页数据，数据回来有一个last_id字段
 *            offset=last_id    获得第3页数据，数据回来有一个last_id字段
 *            付出反复，offset始终等于上次数据回来的last_id字段内容，就可以不断获得下一页数据了
 *            offset/last_id    和  之前 的 timestamp /pre_timestamp作用类似，都是分页
 *        offset=null 获得第1页的5条数据,last_id=5  (id>0)
 *        offset=5    获得第2页的5条数据,last_id=10  (id>5)
 *        offset=10    获得第3页的5条数据,last_id=15 (id>10)
 *        offset=15    获得第4页的5条数据,last_id=20 (id>15)
 *        ……
 *        offset=偏移量    获得第n页的5条数据,last_id=20 (id>offset)
 * limit 否  获取的评论数据个数，不传表示采用后端服务设定的默认每页数据量
 */
export function apiCommentList ({ articleID, offset }) {
  return request({
    url: '/app/v1_0/comments',
    method: 'get',
    params: {
      type: 'a',
      source: articleID,
      offset,
      limit: 10
    }
  })
}
