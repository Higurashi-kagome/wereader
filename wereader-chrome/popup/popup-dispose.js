/* 绑定标签页按钮点击事件、下拉按钮点击事件、书架刷新按钮点击事件并移除不该在当前页面出现的内容 */

// 标签页按钮点击事件
function openTabContent(event) {
    let currentTarget = event.currentTarget;
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    const targetIndex = [...currentTarget.parentElement.children].indexOf(currentTarget);
    tabcontent[targetIndex].style.display = 'block';
    currentTarget.className += " active";
}

// 下拉按钮点击事件
function dropdownClickEvent(){
  this.classList.toggle("active");
  let dropdownContent = this.nextElementSibling;
  if (dropdownContent.style.display === "block") {
    dropdownContent.style.display = "none";
  } else {
    dropdownContent.style.display = "block";
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    function removeTab(id){
        let targetEl = document.getElementById(id);
        const targetIndex = [...targetEl.parentElement.children].indexOf(targetEl);
        let tabcontents = document.getElementsByClassName("tabcontent");
        targetEl.remove();
        tabcontents[targetIndex].remove();
    }
    // 不在读书页时移除笔记及开发者选项
    if(!/:\/\/weread\.qq\.com\/web\/reader\/[^\s]*/.test(tabs[0].url)) {
        removeTab('noteBtn');
        if(bg.Config.enableDevelop) removeTab('testBtn');
    }
    // 绑定标签页按钮点击事件
    let tablinks = document.querySelectorAll('.tablinks');
    tablinks.forEach(tablink=>{
        tablink.addEventListener('click', openTabContent);
    });
    // 绑定下拉按钮点击事件
    document.querySelectorAll('.dropdown-btn').forEach(el=>{
        el.addEventListener("click", dropdownClickEvent);
    });
    // 绑定刷新按钮点击事件
    document.getElementById('reload').onclick = async (e)=>{
      e.stopPropagation();
      document.getElementById('shelf').innerHTML = '<a>...</a>';
      await bg.setShelfForPopup();
      e.target.parentElement.click();
    };
    // 统计按钮点击事件
    if(bg.Config.enableStatistics){
      let statisticBtn = document.getElementById('statisticBtn');
      statisticBtn.style.display = 'block';
      statisticBtn.addEventListener('click',()=>{
        chrome.tabs.create({url: chrome.runtime.getURL('popup/statistics/statistics.html')});
      });
    }
    // 选项页
    if(bg.Config.enableOption){
      const id = 'openOption'
      $('.tab').append(`<button class="tablinks" id="${id}">选项</button>`)
      $(`#${id}`).on('click',()=>{
        chrome.runtime.openOptionsPage()
      })
    }
    // 只有一个按钮被打开时将其设置为全宽
    let count = 0, onlyone = undefined
    document.querySelectorAll('.tablinks').forEach(tablink=>{
      if(window.getComputedStyle(tablink).display !== 'none'){
        onlyone = tablink
        count++
      }
    })
    if(count === 1) onlyone.style.width = '-webkit-fill-available'
    // 默认打开第一个 tab
    tablinks[0].click();
});