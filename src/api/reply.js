import request from '@/utils/request.js'

/**
 * 添加评论或回复内容，一个api承接两个动作
 * target integer 必须  评论的目标id（评论文章即为文章id，对评论进行回复则为评论id）
 * content string 必须  评论内容
 * art_id integer 非必须  【文章id】，添加回复，需要传递此参数
 *                                    添加评论，不要传此参数
 */
export function apiAddCorR ({ target, content, artID = null }) {
  return request({
    url: '/app/v1_0/comments',
    method: 'post',
    data: {
      target,
      content,
      art_id: artID
    }
  })
}

/**
 * 获得"评论"列表
 * type 是 c  c-对评论(comment)获取的回复列表
 * source:commentID 是  源id，评论id
 * offset:lastID 否  获取评论数据的【偏移量】，值为评论id，表示从此id的数据向后取，
 *            不传表示从第一页开始读取数据
 *            offset实现分页效果：
 *            offset=null       获得第1页数据，数据回来有一个last_id字段
 *            offset=last_id    获得第2页数据，数据回来有一个last_id字段
 *            offset=last_id    获得第3页数据，数据回来有一个last_id字段
 *            付出反复，offset始终等于上次数据回来的last_id字段内容，就可以不断获得下一页数据了
 *            offset/last_id    和  之前 的 timestamp /pre_timestamp作用类似，都是分页
 * limit 否  获取的评论数据个数，不传表示采用后端服务设定的默认每页数据量
 */
export function apiReplyList ({ commentID, lastID }) {
  return request({
    url: '/app/v1_0/comments',
    method: 'get',
    params: {
      type: 'c', // 获得回复列表标志
      source: commentID, // 评论id
      offset: lastID, // 偏移量，分页使用
      limit: 10
    }
  })
}
