import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
parts=[open(f).read() for f in sorted(glob.glob('src/app/*.js'))]
open('www/app.js','w').write('(()=>{\n'+'\n'.join(parts)+'\n})();\n')
print('app.js',os.path.getsize('www/app.js'))
