import os
import shutil
#复制 Chrome 扩展文件夹至桌面
chrome_extension_path = r'C:\Users\liuhao\Documents\GitHub\wereader\wereader-chrome'
desktop_path = r'C:\Users\liuhao\Desktop\wereader-chrome'
shutil.copytree(chrome_extension_path, desktop_path)
#删除发布所不需要的文件和文件夹
#data 文件夹
shutil.rmtree(desktop_path + r'\data', ignore_errors=True)
#其他文件
files_need_remove = [r'\wereader-test.js',r'\.gitignore',r'\changeVersion.py',r'\pack.py',r'\tempCodeRunnerFile.py']
for file_name in files_need_remove:
    os.remove(desktop_path + file_name)
