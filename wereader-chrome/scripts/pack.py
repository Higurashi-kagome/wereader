import os
import shutil
import zipfile
from gitignore_parser import parse_gitignore

def removefolder(folder):
    shutil.rmtree(folder, ignore_errors=True)
    print('删除', folder)

def copyfolder(start, to):
    try:
        print('复制', start, to)
        shutil.copytree(start, to)
    except Exception as e:
        return print('移动失败', e)

def removefile(file):
    try:
        os.remove(file)
        print('删除', file)
    except Exception as e:
        return print('文件删除失败', e)

def getallfiles(path):
    allfilelist = os.listdir(path)
    allpath = []
    # 遍历该文件夹下的所有目录或者文件
    for file in allfilelist:
        filepath = os.path.join(path,file)
        # 如果是文件夹，递归调用函数
        if os.path.isdir(filepath):
            allpath = allpath +  getallfiles(filepath)
        # 如果不是文件夹，保存文件路径及文件名
        elif os.path.isfile(filepath):
            allpath.append(filepath)
    return allpath

def isignored(abspath):
    home = os.path.expanduser("~")
    gitignore = os.path.join(home, r'Desktop\wereader-chrome\.gitignore')
    matches = parse_gitignore(gitignore)
    return matches(abspath)

def pack():
    # 复制 Chrome 扩展文件夹至桌面
    home = os.path.expanduser("~")
    extension_repo = os.path.join(home,r'Documents\GitHub\wereader\wereader-chrome')
    desktop_extension = os.path.join(home, r'Desktop\wereader-chrome')
    copyfolder(extension_repo, desktop_extension)
    
    # 解析 .gitignore 并删除文件
    print('\n解析 .gitignore 并删除文件')
    allfiles = getallfiles(desktop_extension)
    for file in allfiles:
        if isignored(file):
            removefile(file)

    # 删除文件夹
    print('\n删除指定文件夹')
    folders_need_remove = ['data', 'scripts', '.vscode']
    for foldername in folders_need_remove:
        folder = os.path.join(desktop_extension, foldername)
        removefolder(folder)
    
    # 删除文件
    print('\n删除指定文件')
    files_need_remove = [r'.gitignore']
    for filename in files_need_remove:
        file = os.path.join(desktop_extension, filename)
        removefile(file)
        
    # 压缩文件
    print('\n压缩文件')
    startdir = desktop_extension  # 要压缩的文件夹路径
    zip_name = startdir + '.zip' # 压缩后压缩包的名字
    z = zipfile.ZipFile(zip_name,'w',zipfile.ZIP_DEFLATED)
    for dirpath, dirnames, filenames in os.walk(startdir):
        fpath = dirpath.replace(startdir,'') # 不 replace 时会从根目录开始复制
        fpath = fpath and fpath + os.sep or ''# 实现当前文件夹以及包含的所有文件的压缩
        for filename in filenames:
            file = os.path.join(dirpath, filename)
            z.write(file, fpath + filename)
            print('压缩', file)
    removefolder(desktop_extension)
    print ('打包完毕')
    z.close()

if __name__ == "__main__":
    pack()