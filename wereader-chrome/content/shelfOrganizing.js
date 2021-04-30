const currentpath = window.location.toString()
const shelfPage = 'https://weread.qq.com/web/shelf'
var shelfdict = {}

function timeConverter(UNIX_timestamp){
  const zeroPad = (num, places) => String(num).padStart(places, '0')
  var a = new Date(UNIX_timestamp * 1000)
  var year = a.getFullYear()
  var month = zeroPad(a.getMonth()+1, 2)
  var day = zeroPad(a.getDate(), 2)
  var hour = zeroPad(a.getHours(), 2)
  var min = zeroPad(a.getMinutes(), 2)
  var sec = zeroPad(a.getSeconds(), 2)
  return `${year}.${month}.${day} ${hour}:${min}`
}

function showToast(toastMsg) {
  if(toastMsg.icon == 'success' || toastMsg.icon == 'warning'){
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 1500,
        onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
    Toast.fire(toastMsg);
  }else{//其他消息
    Swal.fire(toastMsg);
  }
}

function puzzling(t) {
    var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

    if ("number" == typeof t && (t = t.toString()),
    "string" != typeof t)
        return t;
    var e = MD5(t)
      , n = e.substr(0, 3)
      , r = function(t) {
        if (/^\d*$/.test(t)) {
            for (var e = t.length, n = [], r = 0; r < e; r += 9) {
                var i = t.slice(r, Math.min(r + 9, e));
                n.push(parseInt(i).toString(16))
            }
            return ["3", n]
        }
        for (var o = "", a = 0; a < t.length; a++) {
            o += t.charCodeAt(a).toString(16)
        }
        return ["4", [o]]
    }(t);
    n += r[0],
    n += 2 + e.substr(e.length - 2, 2);
    for (var i = r[1], o = 0; o < i.length; o++) {
        var a = i[o].length.toString(16);
        1 === a.length && (a = "0" + a),
        n += a,
        n += i[o],
        o < i.length - 1 && (n += "g")
    }
    return n.length < 20 && (n += e.substr(0, 20 - n.length)),
    n += MD5(n).substr(0, 3)
}

function shelfInsertCheckbox() {
  $('.shelfBook').each(function() {
    var href = $(this).attr('href')
    if (href.startsWith('/web/reader/')) {
      var _key = href.replace('/web/reader/', '')
      if (shelfdict[_key]) {
        $(this).prepend($(`
        <div class="m_webook_shelf_checkbox" style="padding: 5px 0px; align-items: center; justify-content: center;">
          <input type="checkbox" data-id="${shelfdict[_key].bookId}" />
        </div>
        `))
        $(this).attr('id', `bookid-${shelfdict[_key].bookId}`)
      }
    }
  })
  $('input[type="checkbox"]').on('click', function(e) {
    e.stopPropagation()
  })
}

function shelfRemoveBook(bookIds) {
  chrome.runtime.sendMessage({
    type: 'Wereader', 
    func: 'shelfRemoveBook', 
    bookIds: bookIds
  }, resp=>{
    let {data, bookIds} = resp;
    if(data.succ !== 1) return showToast({text: '🐞 移除失败',icon:'warning'});
    bookIds.forEach(function(_id) {
      $(`#bookid-${_id}`).remove()
    })
    $('.m_webook_shelf_checkbox > input').prop('checked', false)
    showToast({text: '👏 移除成功',icon:'success'})
  });
}

function shelfMakeBookPrivate(bookIds) {
  chrome.runtime.sendMessage({
    type: 'Wereader', 
    func: 'shelfMakeBookPrivate', 
    bookIds: bookIds
  }, resp=>{
    let {data, bookIds} = resp;
    if(data.succ !== 1) return showToast({text: '🐞 操作失败',icon:'warning'});
    bookIds.forEach(function(_id) {
      if ($(`#bookid-${_id} > .wr_bookCover > .wr_bookCover_privateTag`).length === 0) {
        $(`#bookid-${_id} > .wr_bookCover`).prepend($(`<span class="wr_bookCover_privateTag"></span>`))
      }
    })
    $('.m_webook_shelf_checkbox > input').prop('checked', false)
    showToast({text: '👏 操作成功',icon:'success'})
  });
}


function shelfMakeBookPublic(bookIds) {
  chrome.runtime.sendMessage({
    type: 'Wereader', 
    func: 'shelfMakeBookPublic', 
    bookIds: bookIds
  }, resp=>{
    let {data, bookIds} = resp;
    if(data.succ !== 1) return showToast({text: '🐞 操作失败',icon:'warning'});
    bookIds.forEach(function(_id) {
      $(`#bookid-${_id} > .wr_bookCover > .wr_bookCover_privateTag`).remove()
    })
    $('.m_webook_shelf_checkbox > input').prop('checked', false)
    showToast({text: '👏 操作成功',icon:'success'})
  });
}


function shelfSelectAll() {
  var isall = false
  $('.m_webook_shelf_checkbox > input').each(function() {
    if (!$(this).is(':checked')) {
      isall = true
    }
  })

  if (isall) {
    $('.m_webook_shelf_checkbox > input').prop('checked', true)
  } else {
    $('.m_webook_shelf_checkbox > input').prop('checked', false)
  }
}

$(document).ready(function() {

  /* 初始化书架数据 */
  fetch(shelfPage).then(function(resp) {return resp.text()}).then(function(data) {
    var initdata = JSON.parse(data.match(/window\.__INITIAL_STATE__\=({.*?});/)[1])
    if (initdata.shelf.books) {
      var books = initdata.shelf.books
      for(var i=0;i<books.length;i++) {
        shelfdict[puzzling(books[i].bookId)] = books[i]
      }
    }
  })

  /* 插入书架管理容器 */
  var _shelfBox = $(`
    <div class="m_shelf_admin">
      <a class="m_webook_shelf_admin" data-status="close">整理书架</a>
      <a class="op m_webook_shelf_remove_book">移出</a>
      <a class="op m_webook_shelf_make_book_private">私密阅读</a>
      <a class="op m_webook_shelf_make_book_public">公开阅读</a>
      <a class="op m_webook_shelf_select_all">全选</a>
    </div>
  `)
  $('.navBar_border').after(_shelfBox)

  /* 公众号 */
  chrome.runtime.sendMessage({type: "getShelf"}, resp => {
      /* 书架中插入公众号 */
      let {data} = resp;
      if(!data.books) return;
      let mps = []
      data.books.forEach(each => {
        if (each.bookId.startsWith('MP_WXS_')) {
          mps.push(each)
          shelfdict[puzzling(each.bookId)] = each
        }
      })
      if (mps.length == 0) return
      mps.forEach(function(mp) {
        let coverImg = `<img src="${mp.cover.replace('http://', 'https://')}" alt="书籍封面" class="wr_bookCover_img">`;
        if(mp.cover.indexOf('http')<0) coverImg = '';
        $('.shelf_list').prepend($(`<a href="/web/reader/${puzzling(mp.bookId)}" class="shelfBook webook_mp" data-id="${mp.bookId}"><div class="wr_bookCover cover">${mp.secret ? '<span class="wr_bookCover_privateTag"></span>': ''}<!----><!---->${coverImg}<div class="wr_bookCover_border"></div><span class="wr_bookCover_decor wr_bookCover_gradientDecor wr_bookCover_borderDecor"></span></div><div class="title">${mp.title}</div><!----></a>`))
      });
      /* 公众号点击事件 */
      $('.webook_mp').on('click', function(e) {
        e.preventDefault()
        let bookId = $(this).data('id')
        if (!bookId) return
        chrome.runtime.sendMessage({
          type: 'createMpPage',
          bookId: bookId
        }, resp => {
          if(resp && resp.errmsg){
            console.log('createMpPage', resp.errmsg);
            window.open(this.href, "_blank");
          }
        });
      });
  });

  $('.m_webook_shelf_admin').on('click', function() {
    let status = $(this).data('status')
    if (status == 'close') {
      shelfInsertCheckbox()
      $('.m_shelf_admin > a.op').css('display', 'block')
      $(this).data('status', 'open')
    } else {
      $('.m_webook_shelf_checkbox').remove()
      $('.m_shelf_admin > a.op').css('display', 'none')
      $(this).data('status', 'close')
    }
  })

  $('.m_webook_shelf_make_book_private').on('click', function() {
    let bookIds = []
    $('.m_webook_shelf_checkbox > input').each(function() {
      if ($(this).is(':checked')) {
        bookIds.push($(this).data('id').toString())
      }
    })
    if (bookIds.length > 0) {
      shelfMakeBookPrivate(bookIds)
    }
  })

  $('.m_webook_shelf_make_book_public').on('click', function() {
    let bookIds = []
    $('.m_webook_shelf_checkbox > input').each(function() {
      if ($(this).is(':checked')) {
        bookIds.push($(this).data('id').toString())
      }
    })
    if (bookIds.length > 0) {
      shelfMakeBookPublic(bookIds)
    }
  })

  $('.m_webook_shelf_remove_book').on('click', function() {
    let bookIds = []
    $('.m_webook_shelf_checkbox > input').each(function() {
      if ($(this).is(':checked')) {
        bookIds.push($(this).data('id').toString())
      }
    })
    if (bookIds.length > 0) {
      shelfRemoveBook(bookIds)
    }
  })

  $('.m_webook_shelf_select_all').on('click', shelfSelectAll)
})
