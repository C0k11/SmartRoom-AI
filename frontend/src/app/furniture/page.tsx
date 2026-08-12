'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExternalLink, 
  Sofa,
  Lamp,
  BedDouble,
  Armchair,
  Frame,
  LayoutGrid,
  Store,
  ChevronRight,
  Globe,
  ShoppingBag
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useLanguage } from '@/lib/i18n'

// Region configurations
const regions = [
  { id: 'cn', name: '中国', nameEn: 'China', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
  { id: 'ca', name: '加拿大', nameEn: 'Canada', flag: '\uD83C\uDDE8\uD83C\uDDE6' },
  { id: 'jp', name: '日本', nameEn: 'Japan', flag: '\uD83C\uDDEF\uD83C\uDDF5' },
]

// China platforms
const chinaPlatforms = [
  {
    id: 'taobao',
    name: '淘宝',
    nameZh: '淘宝',
    logo: 'https://img.alicdn.com/favicon.ico',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    description: '海量商品，价格实惠',
    descriptionEn: 'Massive selection, affordable prices',
    baseUrl: 'https://www.taobao.com',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://s.taobao.com/search?q=家具', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://s.taobao.com/search?q=沙发', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://s.taobao.com/search?q=床', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://s.taobao.com/search?q=椅子', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://s.taobao.com/search?q=桌子 书桌', icon: Frame },
      { name: '灯具', nameEn: 'Lighting', url: 'https://s.taobao.com/search?q=灯具 台灯 落地灯', icon: Lamp },
      { name: '收纳柜', nameEn: 'Storage', url: 'https://s.taobao.com/search?q=收纳柜 书架', icon: LayoutGrid },
    ]
  },
  {
    id: 'jd',
    name: '京东',
    nameZh: '京东',
    logo: 'https://www.jd.com/favicon.ico',
    color: 'from-red-600 to-red-700',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    description: '品质保证，快速配送',
    descriptionEn: 'Quality assured, fast delivery',
    baseUrl: 'https://www.jd.com',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://channel.jd.com/furniture.html', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://search.jd.com/Search?keyword=沙发&enc=utf-8', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://search.jd.com/Search?keyword=床&enc=utf-8', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://search.jd.com/Search?keyword=椅子&enc=utf-8', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://search.jd.com/Search?keyword=书桌&enc=utf-8', icon: Frame },
      { name: '灯具', nameEn: 'Lighting', url: 'https://search.jd.com/Search?keyword=灯具&enc=utf-8', icon: Lamp },
      { name: '收纳', nameEn: 'Storage', url: 'https://search.jd.com/Search?keyword=收纳柜&enc=utf-8', icon: LayoutGrid },
    ]
  },
  {
    id: 'tmall',
    name: '天猫',
    nameZh: '天猫',
    logo: 'https://www.tmall.com/favicon.ico',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    description: '品牌旗舰店，正品保障',
    descriptionEn: 'Brand flagship stores, authentic products',
    baseUrl: 'https://www.tmall.com',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://list.tmall.com/search_product.htm?q=家具', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://list.tmall.com/search_product.htm?q=沙发', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://list.tmall.com/search_product.htm?q=床', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://list.tmall.com/search_product.htm?q=椅子', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://list.tmall.com/search_product.htm?q=书桌', icon: Frame },
      { name: '灯具', nameEn: 'Lighting', url: 'https://list.tmall.com/search_product.htm?q=灯具', icon: Lamp },
      { name: '收纳', nameEn: 'Storage', url: 'https://list.tmall.com/search_product.htm?q=收纳柜', icon: LayoutGrid },
    ]
  },
  {
    id: 'ikea',
    name: 'IKEA',
    nameZh: '宜家中国',
    logo: 'https://www.ikea.cn/etc.clientlibs/ikea/clientlibs/clientlib-site/resources/favicons/favicon-32x32.png',
    color: 'from-blue-500 to-yellow-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: '瑞典家居品牌，简约北欧风格',
    descriptionEn: 'Swedish home furnishing, Nordic style',
    baseUrl: 'https://www.ikea.cn',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://www.ikea.cn/cn/zh/cat/furniture-fu001/', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://www.ikea.cn/cn/zh/cat/sofas-fu003/', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://www.ikea.cn/cn/zh/cat/beds-bm003/', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://www.ikea.cn/cn/zh/cat/chairs-fu002/', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://www.ikea.cn/cn/zh/cat/tables-desks-fu004/', icon: Frame },
      { name: '灯具', nameEn: 'Lighting', url: 'https://www.ikea.cn/cn/zh/cat/lighting-li001/', icon: Lamp },
      { name: '收纳', nameEn: 'Storage', url: 'https://www.ikea.cn/cn/zh/cat/storage-furniture-st001/', icon: LayoutGrid },
    ]
  },
  {
    id: 'yuanshimuyu',
    name: '源氏木语',
    nameZh: '源氏木语',
    logo: '',
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    description: '原木家具，匠心品质',
    descriptionEn: 'Solid wood furniture, craftsman quality',
    baseUrl: 'https://yuanshimuyu.tmall.com',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://yuanshimuyu.tmall.com/category.htm', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://s.taobao.com/search?q=源氏木语 沙发', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://s.taobao.com/search?q=源氏木语 床', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://s.taobao.com/search?q=源氏木语 椅子', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://s.taobao.com/search?q=源氏木语 书桌', icon: Frame },
      { name: '收纳', nameEn: 'Storage', url: 'https://s.taobao.com/search?q=源氏木语 收纳', icon: LayoutGrid },
    ]
  },
  {
    id: 'linshimuye',
    name: '林氏家居',
    nameZh: '林氏家居',
    logo: '',
    color: 'from-emerald-600 to-emerald-800',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    description: '年轻人的家具品牌',
    descriptionEn: 'Furniture brand for young people',
    baseUrl: 'https://linshimuye.tmall.com',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://linshimuye.tmall.com/category.htm', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://s.taobao.com/search?q=林氏家居 沙发', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://s.taobao.com/search?q=林氏家居 床', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://s.taobao.com/search?q=林氏家居 椅子', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://s.taobao.com/search?q=林氏家居 书桌', icon: Frame },
      { name: '灯具', nameEn: 'Lighting', url: 'https://s.taobao.com/search?q=林氏家居 灯', icon: Lamp },
      { name: '收纳', nameEn: 'Storage', url: 'https://s.taobao.com/search?q=林氏家居 收纳', icon: LayoutGrid },
    ]
  },
  {
    id: 'quanyou',
    name: '全友家居',
    nameZh: '全友家居',
    logo: '',
    color: 'from-green-600 to-green-800',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: '中国知名家居品牌',
    descriptionEn: 'Famous Chinese furniture brand',
    baseUrl: 'https://quanyou.tmall.com',
    categories: [
      { name: '全部家具', nameEn: 'All Furniture', url: 'https://quanyou.tmall.com/category.htm', icon: LayoutGrid },
      { name: '沙发', nameEn: 'Sofas', url: 'https://s.taobao.com/search?q=全友家居 沙发', icon: Sofa },
      { name: '床', nameEn: 'Beds', url: 'https://s.taobao.com/search?q=全友家居 床', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://s.taobao.com/search?q=全友家居 椅子', icon: Armchair },
      { name: '桌子', nameEn: 'Tables', url: 'https://s.taobao.com/search?q=全友家居 餐桌', icon: Frame },
      { name: '收纳', nameEn: 'Storage', url: 'https://s.taobao.com/search?q=全友家居 衣柜', icon: LayoutGrid },
    ]
  },
  {
    id: 'xiaomi',
    name: '小米有品',
    nameZh: '小米有品',
    logo: '',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    description: '智能家居生态链',
    descriptionEn: 'Smart home ecosystem',
    baseUrl: 'https://www.xiaomiyoupin.com',
    categories: [
      { name: '全部家居', nameEn: 'All Home', url: 'https://www.xiaomiyoupin.com/category?cid=21', icon: LayoutGrid },
      { name: '智能家居', nameEn: 'Smart Home', url: 'https://www.xiaomiyoupin.com/category?cid=2', icon: Lamp },
      { name: '家具', nameEn: 'Furniture', url: 'https://search.jd.com/Search?keyword=小米有品 家具&enc=utf-8', icon: Sofa },
      { name: '灯具', nameEn: 'Lighting', url: 'https://search.jd.com/Search?keyword=米家 灯&enc=utf-8', icon: Lamp },
      { name: '收纳', nameEn: 'Storage', url: 'https://search.jd.com/Search?keyword=小米有品 收纳&enc=utf-8', icon: LayoutGrid },
    ]
  },
]

// Canada platforms
const canadaPlatforms = [
  {
    id: 'amazon-ca',
    name: 'Amazon',
    nameZh: '亚马逊加拿大',
    logo: '',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    description: 'Everything you need, delivered fast',
    descriptionEn: 'Everything you need, delivered fast',
    baseUrl: 'https://www.amazon.ca',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.amazon.ca/s?k=furniture', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.amazon.ca/s?k=sofa', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.amazon.ca/s?k=bed+frame', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.amazon.ca/s?k=chair', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.amazon.ca/s?k=desk', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.amazon.ca/s?k=floor+lamp', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.amazon.ca/s?k=storage+shelf', icon: LayoutGrid },
    ]
  },
  {
    id: 'ikea-ca',
    name: 'IKEA',
    nameZh: '宜家加拿大',
    logo: '',
    color: 'from-blue-500 to-yellow-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Swedish home furnishing, affordable design',
    descriptionEn: 'Swedish home furnishing, affordable design',
    baseUrl: 'https://www.ikea.com/ca/en/',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.ikea.com/ca/en/cat/furniture-fu001/', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.ikea.com/ca/en/cat/sofas-fu003/', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.ikea.com/ca/en/cat/beds-bm003/', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.ikea.com/ca/en/cat/chairs-fu002/', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.ikea.com/ca/en/cat/desks-20649/', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.ikea.com/ca/en/cat/lighting-li001/', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.ikea.com/ca/en/cat/storage-furniture-st001/', icon: LayoutGrid },
    ]
  },
  {
    id: 'wayfair',
    name: 'Wayfair',
    nameZh: 'Wayfair',
    logo: '',
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'A zillion things home',
    descriptionEn: 'A zillion things home',
    baseUrl: 'https://www.wayfair.ca',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.wayfair.ca/furniture/cat/furniture-c45974.html', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.wayfair.ca/furniture/sb0/sofas-c413892.html', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.wayfair.ca/furniture/sb0/beds-c413978.html', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.wayfair.ca/furniture/sb0/accent-chairs-c413836.html', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.wayfair.ca/furniture/sb0/desks-c45706.html', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.wayfair.ca/lighting/cat/lighting-c215329.html', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.wayfair.ca/storage-organization/cat/storage-organization-c215875.html', icon: LayoutGrid },
    ]
  },
  {
    id: 'structube',
    name: 'Structube',
    nameZh: 'Structube',
    logo: '',
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    description: 'Modern furniture at affordable prices',
    descriptionEn: 'Modern furniture at affordable prices',
    baseUrl: 'https://www.structube.com',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.structube.com/en_ca/furniture', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.structube.com/en_ca/living/sofas', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.structube.com/en_ca/bedroom/beds', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.structube.com/en_ca/living/chairs', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.structube.com/en_ca/office/desks', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.structube.com/en_ca/decor/lighting', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.structube.com/en_ca/living/storage', icon: LayoutGrid },
    ]
  },
  {
    id: 'cb2',
    name: 'CB2',
    nameZh: 'CB2',
    logo: '',
    color: 'from-black to-gray-800',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    description: 'Modern furniture and home decor',
    descriptionEn: 'Modern furniture and home decor',
    baseUrl: 'https://www.cb2.ca',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.cb2.ca/furniture/', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.cb2.ca/furniture/sofas/', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.cb2.ca/furniture/bedroom/beds/', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.cb2.ca/furniture/chairs/', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.cb2.ca/furniture/office/desks/', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.cb2.ca/lighting/', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.cb2.ca/furniture/storage/', icon: LayoutGrid },
    ]
  },
  {
    id: 'westelm',
    name: 'West Elm',
    nameZh: 'West Elm',
    logo: '',
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    description: 'Modern furniture and home accessories',
    descriptionEn: 'Modern furniture and home accessories',
    baseUrl: 'https://www.westelm.ca',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.westelm.ca/furniture/', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.westelm.ca/sofas-sectionals/', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.westelm.ca/beds/', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.westelm.ca/chairs/', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.westelm.ca/desks/', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.westelm.ca/lighting/', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.westelm.ca/storage/', icon: LayoutGrid },
    ]
  },
  {
    id: 'eq3',
    name: 'EQ3',
    nameZh: 'EQ3',
    logo: '',
    color: 'from-teal-600 to-teal-800',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    description: 'Canadian modern furniture',
    descriptionEn: 'Canadian modern furniture',
    baseUrl: 'https://www.eq3.com',
    categories: [
      { name: 'All Furniture', nameEn: 'All Furniture', url: 'https://www.eq3.com/ca/en/shop/furniture', icon: LayoutGrid },
      { name: 'Sofas', nameEn: 'Sofas', url: 'https://www.eq3.com/ca/en/shop/furniture/living/sofas', icon: Sofa },
      { name: 'Beds', nameEn: 'Beds', url: 'https://www.eq3.com/ca/en/shop/furniture/bedroom/beds', icon: BedDouble },
      { name: 'Chairs', nameEn: 'Chairs', url: 'https://www.eq3.com/ca/en/shop/furniture/living/chairs', icon: Armchair },
      { name: 'Desks', nameEn: 'Desks', url: 'https://www.eq3.com/ca/en/shop/furniture/office/desks', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.eq3.com/ca/en/shop/lighting', icon: Lamp },
      { name: 'Storage', nameEn: 'Storage', url: 'https://www.eq3.com/ca/en/shop/furniture/storage', icon: LayoutGrid },
    ]
  },
  {
    id: 'homesense',
    name: 'HomeSense',
    nameZh: 'HomeSense',
    logo: '',
    color: 'from-red-500 to-red-700',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    description: 'Unique home finds at great prices',
    descriptionEn: 'Unique home finds at great prices',
    baseUrl: 'https://www.homesense.ca',
    categories: [
      { name: 'Store Locator', nameEn: 'Store Locator', url: 'https://www.homesense.ca/en/stores', icon: LayoutGrid },
      { name: 'Furniture', nameEn: 'Furniture', url: 'https://www.amazon.ca/s?k=homesense+furniture', icon: Sofa },
      { name: 'Home Decor', nameEn: 'Home Decor', url: 'https://www.amazon.ca/s?k=home+decor', icon: Frame },
      { name: 'Lighting', nameEn: 'Lighting', url: 'https://www.amazon.ca/s?k=home+lighting', icon: Lamp },
    ]
  },
]

// Japan platforms
const japanPlatforms = [
  {
    id: 'amazon-jp',
    name: 'Amazon',
    nameZh: '亚马逊日本',
    logo: '',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    description: '豊富な品揃え、迅速配送',
    descriptionEn: 'Vast selection, fast delivery',
    baseUrl: 'https://www.amazon.co.jp',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://www.amazon.co.jp/s?k=家具', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://www.amazon.co.jp/s?k=ソファ', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://www.amazon.co.jp/s?k=ベッド', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://www.amazon.co.jp/s?k=椅子', icon: Armchair },
      { name: 'デスク', nameEn: 'Desks', url: 'https://www.amazon.co.jp/s?k=デスク', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://www.amazon.co.jp/s?k=照明', icon: Lamp },
      { name: '収納', nameEn: 'Storage', url: 'https://www.amazon.co.jp/s?k=収納', icon: LayoutGrid },
    ]
  },
  {
    id: 'rakuten',
    name: '楽天市場',
    nameZh: '乐天市场',
    logo: '',
    color: 'from-red-600 to-red-700',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    description: '日本最大級のショッピングモール',
    descriptionEn: 'Japan largest shopping mall',
    baseUrl: 'https://www.rakuten.co.jp',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://search.rakuten.co.jp/search/mall/家具/', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://search.rakuten.co.jp/search/mall/ソファ/', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://search.rakuten.co.jp/search/mall/ベッド/', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://search.rakuten.co.jp/search/mall/椅子/', icon: Armchair },
      { name: 'デスク', nameEn: 'Desks', url: 'https://search.rakuten.co.jp/search/mall/デスク/', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://search.rakuten.co.jp/search/mall/照明/', icon: Lamp },
      { name: '収納', nameEn: 'Storage', url: 'https://search.rakuten.co.jp/search/mall/収納/', icon: LayoutGrid },
    ]
  },
  {
    id: 'muji-jp',
    name: '無印良品',
    nameZh: '无印良品',
    logo: '',
    color: 'from-warmgray-600 to-warmgray-800',
    bgColor: 'bg-warmgray-50',
    textColor: 'text-warmgray-700',
    description: 'シンプルで質の良い生活',
    descriptionEn: 'Simple, quality life',
    baseUrl: 'https://www.muji.com/jp/',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S1070101', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S107010201', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S107010101', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S107010301', icon: Armchair },
      { name: 'デスク', nameEn: 'Desks', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S107010401', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S10702', icon: Lamp },
      { name: '収納', nameEn: 'Storage', url: 'https://www.muji.com/jp/ja/store/cmdty/section/S10703', icon: LayoutGrid },
    ]
  },
  {
    id: 'ikea-jp',
    name: 'IKEA',
    nameZh: '宜家日本',
    logo: '',
    color: 'from-blue-500 to-yellow-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'スウェーデン発の家具ブランド',
    descriptionEn: 'Swedish home furnishing',
    baseUrl: 'https://www.ikea.com/jp/ja/',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://www.ikea.com/jp/ja/cat/furniture-fu001/', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://www.ikea.com/jp/ja/cat/sofas-fu003/', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://www.ikea.com/jp/ja/cat/beds-bm003/', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://www.ikea.com/jp/ja/cat/chairs-fu002/', icon: Armchair },
      { name: 'デスク', nameEn: 'Desks', url: 'https://www.ikea.com/jp/ja/cat/desks-20649/', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://www.ikea.com/jp/ja/cat/lighting-li001/', icon: Lamp },
      { name: '収納', nameEn: 'Storage', url: 'https://www.ikea.com/jp/ja/cat/storage-furniture-st001/', icon: LayoutGrid },
    ]
  },
  {
    id: 'nitori',
    name: 'ニトリ',
    nameZh: '尼达利',
    logo: '',
    color: 'from-green-600 to-green-700',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    description: 'お、ねだん以上。ニトリ',
    descriptionEn: 'Quality furniture at great prices',
    baseUrl: 'https://www.nitori-net.jp',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://www.nitori-net.jp/ec/cat/Furniture/', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://www.nitori-net.jp/ec/cat/Sofa/', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://www.nitori-net.jp/ec/cat/Bed/', icon: BedDouble },
      { name: '椅子', nameEn: 'Chairs', url: 'https://www.nitori-net.jp/ec/cat/Chair/', icon: Armchair },
      { name: 'デスク', nameEn: 'Desks', url: 'https://www.nitori-net.jp/ec/cat/Desk/', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://www.nitori-net.jp/ec/cat/Light/', icon: Lamp },
      { name: '収納', nameEn: 'Storage', url: 'https://www.nitori-net.jp/ec/cat/Storage/', icon: LayoutGrid },
    ]
  },
  {
    id: 'francfranc',
    name: 'Francfranc',
    nameZh: 'Francfranc',
    logo: '',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    description: 'デザイン性の高いインテリア',
    descriptionEn: 'Stylish interior design',
    baseUrl: 'https://francfranc.com',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://francfranc.com/collections/furniture', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://francfranc.com/collections/sofa', icon: Sofa },
      { name: 'チェア', nameEn: 'Chairs', url: 'https://francfranc.com/collections/chair', icon: Armchair },
      { name: 'テーブル', nameEn: 'Tables', url: 'https://francfranc.com/collections/table', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://francfranc.com/collections/lighting', icon: Lamp },
      { name: '収納', nameEn: 'Storage', url: 'https://francfranc.com/collections/storage', icon: LayoutGrid },
    ]
  },
  {
    id: 'actus',
    name: 'ACTUS',
    nameZh: 'ACTUS',
    logo: '',
    color: 'from-amber-700 to-amber-800',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    description: '上質なライフスタイルを提案',
    descriptionEn: 'Premium lifestyle furniture',
    baseUrl: 'https://online.actus-interior.com',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://online.actus-interior.com/furniture/', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://online.actus-interior.com/furniture/sofa/', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://online.actus-interior.com/furniture/bed/', icon: BedDouble },
      { name: 'チェア', nameEn: 'Chairs', url: 'https://online.actus-interior.com/furniture/chair/', icon: Armchair },
      { name: 'テーブル', nameEn: 'Tables', url: 'https://online.actus-interior.com/furniture/table/', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://online.actus-interior.com/lighting/', icon: Lamp },
    ]
  },
  {
    id: 'unico',
    name: 'unico',
    nameZh: 'unico',
    logo: '',
    color: 'from-teal-600 to-teal-700',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    description: 'ナチュラルヴィンテージ',
    descriptionEn: 'Natural vintage style',
    baseUrl: 'https://www.unico-fan.co.jp',
    categories: [
      { name: '家具', nameEn: 'All Furniture', url: 'https://www.unico-fan.co.jp/category/FURNITURE/', icon: LayoutGrid },
      { name: 'ソファ', nameEn: 'Sofas', url: 'https://www.unico-fan.co.jp/category/SOFA/', icon: Sofa },
      { name: 'ベッド', nameEn: 'Beds', url: 'https://www.unico-fan.co.jp/category/BED/', icon: BedDouble },
      { name: 'チェア', nameEn: 'Chairs', url: 'https://www.unico-fan.co.jp/category/CHAIR/', icon: Armchair },
      { name: 'テーブル', nameEn: 'Tables', url: 'https://www.unico-fan.co.jp/category/TABLE/', icon: Frame },
      { name: '照明', nameEn: 'Lighting', url: 'https://www.unico-fan.co.jp/category/LIGHT/', icon: Lamp },
    ]
  },
]

export default function FurniturePage() {
  const { language } = useLanguage()
  const [selectedRegion, setSelectedRegion] = useState<'cn' | 'ca' | 'jp'>('cn')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  // Get platforms based on selected region
  const platforms = selectedRegion === 'cn' 
    ? chinaPlatforms 
    : selectedRegion === 'ca' 
      ? canadaPlatforms 
      : japanPlatforms

  const texts = {
    zh: {
      title: '家具商城',
      subtitle: '一站式浏览各大电商平台家具，比价选购更方便',
      selectRegion: '选择地区',
      selectPlatform: '选择购物平台',
      selectCategory: '选择分类',
      openInNewTab: '在新标签页打开',
      backToPlatforms: '返回平台列表',
      viewOnPlatform: '在平台查看',
      tip: '点击分类直接跳转到对应平台商品页面',
      tipEmbedded: '提示：部分平台可能需要登录才能查看完整内容',
    },
    en: {
      title: 'Furniture Store',
      subtitle: 'Browse furniture from major e-commerce platforms in one place',
      selectRegion: 'Select Region',
      selectPlatform: 'Select Platform',
      selectCategory: 'Select Category',
      openInNewTab: 'Open in New Tab',
      backToPlatforms: 'Back to Platforms',
      viewOnPlatform: 'View on Platform',
      tip: 'Click category to go directly to platform product page',
      tipEmbedded: 'Tip: Some platforms may require login to view full content',
    }
  }
  const txt = texts[language]

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform)

  const handleCategoryClick = (url: string) => {
    // Open in new tab for better user experience
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen flex flex-col bg-warmgray-50">
      <Header />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold mb-4"
            >
              {txt.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-warmgray-600 max-w-2xl mx-auto"
            >
              {txt.subtitle}
            </motion.p>
          </div>

          {!selectedPlatform ? (
            <>
              {/* Region Selector */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-10"
              >
                <div className="inline-flex bg-white rounded-2xl p-2 shadow-sm border border-warmgray-100">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setSelectedRegion(region.id as 'cn' | 'ca' | 'jp')
                        setSelectedPlatform(null)
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        selectedRegion === region.id
                          ? 'bg-terracotta-500 text-white shadow-md'
                          : 'text-warmgray-600 hover:bg-warmgray-50'
                      }`}
                    >
                      <span className="text-xl">{region.flag}</span>
                      <span>{language === 'zh' ? region.name : region.nameEn}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Platform Selection */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-warmgray-800 mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {txt.selectPlatform}
                  <span className="text-sm font-normal text-warmgray-500 ml-2">
                    ({selectedRegion === 'cn' 
                      ? (language === 'zh' ? '中国平台' : 'China') 
                      : selectedRegion === 'ca' 
                        ? (language === 'zh' ? '加拿大平台' : 'Canada')
                        : (language === 'zh' ? '日本平台' : 'Japan')})
                  </span>
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {platforms.map((platform, index) => (
                    <motion.button
                      key={platform.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`${platform.bgColor} rounded-2xl p-6 text-left hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-warmgray-200`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                          {platform.name.charAt(0)}
                        </div>
                        <ChevronRight className={`w-5 h-5 ${platform.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      
                      <h3 className={`text-xl font-bold ${platform.textColor} mb-1`}>
                        {platform.name}
                      </h3>
                      <p className="text-sm text-warmgray-500 mb-3">
                        {language === 'zh' ? platform.nameZh : platform.name}
                      </p>
                      <p className="text-sm text-warmgray-600">
                        {language === 'zh' ? platform.description : platform.descriptionEn}
                      </p>
                      
                      {/* Category preview */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {platform.categories.slice(0, 4).map(cat => (
                          <span key={cat.name} className="text-xs px-2 py-1 bg-white/60 rounded-full text-warmgray-600">
                            {language === 'zh' ? cat.name : cat.nameEn}
                          </span>
                        ))}
                        {platform.categories.length > 4 && (
                          <span className="text-xs px-2 py-1 bg-white/60 rounded-full text-warmgray-500">
                            +{platform.categories.length - 4}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Quick tip */}
              <div className="text-center text-warmgray-500 text-sm mt-8">
                <Globe className="w-4 h-4 inline-block mr-2" />
                {txt.tip}
              </div>
            </>
          ) : (
            <>
              {/* Selected Platform View */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
              >
                {/* Back button and platform header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => {
                      setSelectedPlatform(null)
                      setIframeUrl(null)
                    }}
                    className="flex items-center gap-2 text-warmgray-600 hover:text-warmgray-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    {txt.backToPlatforms}
                  </button>
                  
                  <a
                    href={selectedPlatformData?.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedPlatformData?.bgColor} ${selectedPlatformData?.textColor} hover:shadow-md transition-all`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {txt.viewOnPlatform}
                  </a>
                </div>

                {/* Platform info */}
                <div className={`${selectedPlatformData?.bgColor} rounded-2xl p-6 mb-8`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedPlatformData?.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                      {selectedPlatformData?.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${selectedPlatformData?.textColor}`}>
                        {selectedPlatformData?.name}
                      </h2>
                      <p className="text-warmgray-600">
                        {language === 'zh' ? selectedPlatformData?.description : selectedPlatformData?.descriptionEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category grid */}
                <h3 className="text-lg font-semibold text-warmgray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {txt.selectCategory}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedPlatformData?.categories.map((category, index) => {
                    const IconComponent = category.icon
                    return (
                      <motion.button
                        key={category.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        onClick={() => handleCategoryClick(category.url)}
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 group border border-warmgray-100 hover:border-terracotta-200 text-left"
                      >
                        <div className={`w-12 h-12 rounded-lg ${selectedPlatformData?.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <IconComponent className={`w-6 h-6 ${selectedPlatformData?.textColor}`} />
                        </div>
                        <h4 className="font-semibold text-warmgray-800 group-hover:text-terracotta-600 transition-colors">
                          {language === 'zh' ? category.name : category.nameEn}
                        </h4>
                        <div className="flex items-center gap-1 mt-2 text-sm text-warmgray-500">
                          <span>{txt.openInNewTab}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Info tip */}
                <div className="text-center text-warmgray-500 text-sm mt-8 p-4 bg-warmgray-100 rounded-lg">
                  <Globe className="w-4 h-4 inline-block mr-2" />
                  {txt.tipEmbedded}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
