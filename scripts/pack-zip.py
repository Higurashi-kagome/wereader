import os
import shutil
import zipfile
from gitignore_parser import parse_gitignore

def remove_folder(folder):
	shutil.rmtree(folder, ignore_errors=True)
	print('删除', folder)

def copy_folder(start, to):
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

def get_all_files(path):
	all_file_list = os.listdir(path)
	all_path = []
	# 遍历该文件夹下的所有目录或者文件
	for file in all_file_list:
		filepath = os.path.join(path,file)
		# 如果是文件夹，递归调用函数
		if os.path.isdir(filepath):
			all_path = all_path +  get_all_files(filepath)
		# 如果不是文件夹，保存文件路径及文件名
		elif os.path.isfile(filepath):
			all_path.append(filepath)
	return all_path

def is_ignored(abspath):
	home = os.path.expanduser("~")
	gitignore = os.path.join(home, r'Desktop\wereader-chrome\.gitignore')
	matches = parse_gitignore(gitignore)
	return matches(abspath)

def pack():
	# 复制 Chrome 扩展文件夹至项目根目录
	# 需要在项目根目录下运行脚本，保证 os.getcwd() 为项目根目录
	project_home = os.getcwd()
	extension_dist = os.path.abspath(os.path.join(project_home, 'dist'))
	extension_dir = os.path.abspath(os.path.join(project_home, 'wereader'))
	copy_folder(extension_dist, extension_dir)
	
	# 解析 .gitignore 并删除文件
	""" print('\n解析 .gitignore 并删除文件')
	all_files = get_all_files(desktop_extension)
	for file in all_files:
		if is_ignored(file):
			removefile(file) """

	# 删除文件夹
	""" print('\n删除指定文件夹')
	folders_need_remove = ['data', 'scripts', '.vscode']
	for foldername in folders_need_remove:
		folder = os.path.join(desktop_extension, foldername)
		remove_folder(folder) """
	
	# 删除文件
	""" print('\n删除指定文件')
	files_need_remove = [r'.gitignore']
	for filename in files_need_remove:
		file = os.path.join(desktop_extension, filename)
		removefile(file) """
		
	# 压缩文件
	print('\n压缩文件')
	start_dir = extension_dir  # 要压缩的文件夹路径
	zip_name = start_dir + '.zip' # 压缩后压缩包的名字
	z = zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED)
	for dirpath, dirnames, filenames in os.walk(start_dir):
		fpath = dirpath.replace(start_dir, '') # 不 replace 时会从根目录开始复制
		fpath = fpath and fpath + os.sep or ''# 实现当前文件夹以及包含的所有文件的压缩
		for filename in filenames:
			file = os.path.join(dirpath, filename)
			z.write(file, fpath + filename)
			print('压缩', file)
	remove_folder(extension_dir)
	print ('打包完毕')
	z.close()

if __name__ == "__main__":
	pack()
	# TODO 整理文件