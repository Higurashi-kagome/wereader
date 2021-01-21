import re

def update_version():
    #读取 manifest.json
    chrome_manifest_file_path = r"C:\Users\liuhao\Documents\GitHub\wereader\wereader-chrome\manifest.json"
    chrome_manifest_file = open(chrome_manifest_file_path,encoding='utf-8')
    lines = chrome_manifest_file.read()

    #获取 manifest.json 中的扩展版本号并打印
    chrome_manifest_version = re.search(r'(?<="version": ")(\d{1,2}\.\d{1,2}\.\d{1,2})',lines).group()
    print("chrome_manifest_version:" + chrome_manifest_version)
    chrome_manifest_file.close()

    #读取 README.md
    readme_file_path = r"C:\Users\liuhao\Documents\GitHub\wereader\README.md"
    readme_file = open(readme_file_path,mode='r',encoding='utf-8')
    lines = readme_file.read()

    #获取 README.md 中的 Chrome 扩展版本号并打印
    readme_version = re.search(r'(?<=store-v)(\d{1,2}\.\d{1,2}\.\d{1,2})',lines).group()
    print("readme_version:" + readme_version)

    #将文件内容中的 Chrome 扩展版本号替换为 manifest.json 中的扩展版本号
    replaced_lines = re.sub(r'(?<=store-v)(\d{1,2}\.\d{1,2}\.\d{1,2})',chrome_manifest_version,lines)
    readme_file.close()

    #将替换后的内容写入 README.md
    readme_file = open(readme_file_path,mode='w',encoding='utf-8')
    readme_file.write(replaced_lines)
    readme_file.close()

if __name__ == "__main__":
    update_version()