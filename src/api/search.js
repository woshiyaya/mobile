// 导入axios
import request from '@/utils/request.js'

// 搜索相关的api函数制作

/**
 * 根据关键字检索香瓜的文章
 * page 否  页数，不传默认为1
 * per_page 否  每页数量，不传每页数量由后端决定
 * q 是  搜索关键词
 */
export function apiSearchList ({ q, page = 1, perPage = 10 }) {
  return request({
    url: '/app/v1_0/search',
    method: 'get',
    params: {
      q,
      page,
      per_page: perPage
    }
  })
}

/**
 * 根据用户输入信息，获得联想关键字
 * @param {用户输入的关键字} q
 */
export function apiSearchSuggestion (q) {
  return request({
    url: '/app/v1_0/suggestion',
    method: 'get',
    params: {
      q
    }
  })
}
