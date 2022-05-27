import os
import sys
from time import sleep

def remove_file(file):
    try:
        os.remove(file)
        print('delete ', file)
    except Exception as e:
        pass

# 使用 python 唤起 msedge.exe 将扩展打包成 crx 文件
# 需要将 msedge.exe 添加到 Path 环境变量，或者将 edge 变量设置为浏览器的绝对路径
if __name__ == '__main__':
    if (not sys.argv[1]):
        sys.exit()
    parent = sys.argv[1]
    wereader = os.path.join(parent, 'wereader.crx')
    pem = os.path.join(parent, "dist.pem")
    # 删除旧文件
    remove_file(wereader)
    remove_file(pem)
    # 打包 crx 文件
    dist = os.path.join(parent, "dist")
    edge = "msedge.exe"
    command = edge + ' --pack-extension=' + os.path.abspath(dist)
    os.system(command)
    # 重命名 dist.crx 为 wereader.crx
    sleep(2)
    crx = os.path.join(parent, 'dist.crx')
    # print(crx)
    # print(wereader)
    os.rename(crx, wereader)
    # 通知
    if (os.path.exists(wereader) and os.path.isfile(wereader)):
        print("create " + wereader + " success")
    else:
        print("create " + wereader + " failed")