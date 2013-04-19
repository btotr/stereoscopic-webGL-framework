import bpy
import sys
from string import Template

""" 
Name: 'Webgl Scene Exporter'
Blender: 2.54 Beta
Group: 'Export' 
Tooltip: 'Webgl Scene Export to clipboard' 
""" 
__author__ = "Schell Scivally / Colin Meerveld" 
__version__ = "0.02"

def paste(data):
	import subprocess
	p = subprocess.Popen(["pbcopy"], stdin=subprocess.PIPE)
	p.stdin.write(data.encode("ascii"))
	p.stdin.close()
	retcode = p.wait()

def export_model(obj):
	i = 0
	# TODO make relative
	resdir = '/Applications/blender-2.54/blender.app/Contents/MacOS/2.54/scripts/io'
	# setup the templates
	modelcode = ''
	modeltemplatefile = open(resdir+'/templates_efnx/model.js', 'r')
	modeltemplate = Template(modeltemplatefile.read())
	modeltemplatefile.close();
	facecode = ''
	facetemplatefile = open(resdir+'/templates_efnx/face.js', 'r')
	facetemplate = Template(facetemplatefile.read())
	facetemplatefile.close()
	
	vertextemplatefile = open(resdir+'/templates_efnx/vertices.js', 'r')
	vertextemplate = Template(vertextemplatefile.read())
	vertextemplatefile.close()

	mesh = obj.data
	faceid = 0
	for face in mesh.faces:
	    # vertices 
		vertexcode = ''
		scene = bpy.context.scene
		
		for frame in range(scene.frame_start, scene.frame_end):
			scene.frame_set(frame)
			tmpMesh = mesh.copy()
			tmpMesh = obj.create_mesh(scene, True, 'RENDER')
			tmpMesh.transform(obj.matrix_world)

			v1 = tmpMesh.vertices[tmpMesh.faces[faceid].vertices[0]]
			v2 = tmpMesh.vertices[tmpMesh.faces[faceid].vertices[1]]
			v3 = tmpMesh.vertices[tmpMesh.faces[faceid].vertices[2]]
			vertexcode += vertextemplate.substitute(frame=frame-1, v1x=v1.co.x, v1y=v1.co.y, v1z=v1.co.z, v2x=v2.co.x, v2y=v2.co.y, v2z=v2.co.z, v3x=v3.co.x, v3y=v3.co.y, v3z=v3.co.z)

	    # face 
		scene.frame_current = 0
		faceid += 1
		if(len(mesh.uv_textures) > 0 and type(mesh.uv_textures[0].data[face.index].image) is not type(None)):
			meshtex = mesh.uv_textures[0].data[face.index]
			texture = meshtex.image.name
			t1 = meshtex.uv[0]
			t2 = meshtex.uv[1]
			t3 = meshtex.uv[2]
		else:
			texture = 'null'
			t1 = ['null', 'null']
			t2 = ['null', 'null']
			t3 = ['null', 'null']
			
		n = face.normal
		
		i += 1
		
		facecode += facetemplate.substitute(iface=str(i), vertexcode=vertexcode, texture=texture, nx=n.x, ny=n.y, nz=n.z, t1u=t1[0], t1v=t1[1], t2u=t2[0], t2v=t2[1], t3u=t3[0], t3v=t3[1])

    # model
	name = str.replace(obj.name, '.', '_')
	locx = obj.location.x
	locy = obj.location.y
	locz = obj.location.z
	rotux = obj.rotation_euler[0]
	rotuy = obj.rotation_euler[1]
	rotuz = obj.rotation_euler[2]
	ml00 = obj.matrix_local[0][0]
	ml01 = obj.matrix_local[0][1]
	ml02 = obj.matrix_local[0][2]
	ml03 = obj.matrix_local[0][3]
	ml10 = obj.matrix_local[1][0]
	ml11 = obj.matrix_local[1][1]
	ml12 = obj.matrix_local[1][2]
	ml13 = obj.matrix_local[1][3]
	ml20 = obj.matrix_local[2][0]
	ml21 = obj.matrix_local[2][1]
	ml22 = obj.matrix_local[2][2]
	ml23 = obj.matrix_local[2][3]
	ml30 = obj.matrix_local[3][0]
	ml31 = obj.matrix_local[3][1]
	ml32 = obj.matrix_local[3][2]
	ml33 = obj.matrix_local[3][3]
	mw00 = obj.matrix_world[0][0]
	mw01 = obj.matrix_world[0][1]
	mw02 = obj.matrix_world[0][2]
	mw03 = obj.matrix_world[0][3]
	mw10 = obj.matrix_world[1][0]
	mw11 = obj.matrix_world[1][1]
	mw12 = obj.matrix_world[1][2]
	mw13 = obj.matrix_world[1][3]
	mw20 = obj.matrix_world[2][0]
	mw21 = obj.matrix_world[2][1]
	mw22 = obj.matrix_world[2][2]
	mw23 = obj.matrix_world[2][3]
	mw30 = obj.matrix_world[3][0]
	mw31 = obj.matrix_world[3][1]
	mw32 = obj.matrix_world[3][2]
	mw33 = obj.matrix_world[3][3]
	
	modelcode = modeltemplate.substitute(name=name, facecode=facecode, locx=locx, locy=locy, locz=locz, rotux=rotux, rotuy=rotuy, rotuz=rotuz, ml00=ml00, ml01=ml01, ml02=ml02, ml03=ml03, ml10=ml10, ml11=ml11, ml12=ml12, ml13=ml13, ml20=ml20, ml21=ml21, ml22=ml22, ml23=ml23, ml30=ml30, ml31=ml31, ml32=ml32, ml33=ml33, mw00=mw00, mw01=mw01, mw02=mw02, mw03=mw03, mw10=mw10, mw11=mw11, mw12=mw12, mw13=mw13, mw20=mw20, mw21=mw21, mw22=mw22, mw23=mw23, mw30=mw30, mw31=mw31, mw32=mw32, mw33=mw33)
	return modelcode

def export_camera(obj):
	resdir = '/Applications/blender-2.54/blender.app/Contents/MacOS/2.54/scripts/io'
	#setup the template
	cameracode = ''
	cameratemplatefile = open(resdir+'/templates_efnx/camera.js', 'r')
	cameratemplate = Template(cameratemplatefile.read())
	cameratemplatefile.close();

	name = str.replace(obj.name, '.', '_')
	locx = obj.location.x
	locy = obj.location.y
	locz = obj.location.z
	rotux = obj.rotation_euler[0]
	rotuy = obj.rotation_euler[1]
	rotuz = obj.rotation_euler[2]
	ml00 = obj.matrix_local[0][0]
	ml01 = obj.matrix_local[0][1]
	ml02 = obj.matrix_local[0][2]
	ml03 = obj.matrix_local[0][3]
	ml10 = obj.matrix_local[1][0]
	ml11 = obj.matrix_local[1][1]
	ml12 = obj.matrix_local[1][2]
	ml13 = obj.matrix_local[1][3]
	ml20 = obj.matrix_local[2][0]
	ml21 = obj.matrix_local[2][1]
	ml22 = obj.matrix_local[2][2]
	ml23 = obj.matrix_local[2][3]
	ml30 = obj.matrix_local[3][0]
	ml31 = obj.matrix_local[3][1]
	ml32 = obj.matrix_local[3][2]
	ml33 = obj.matrix_local[3][3]
	mw00 = obj.matrix_world[0][0]
	mw01 = obj.matrix_world[0][1]
	mw02 = obj.matrix_world[0][2]
	mw03 = obj.matrix_world[0][3]
	mw10 = obj.matrix_world[1][0]
	mw11 = obj.matrix_world[1][1]
	mw12 = obj.matrix_world[1][2]
	mw13 = obj.matrix_world[1][3]
	mw20 = obj.matrix_world[2][0]
	mw21 = obj.matrix_world[2][1]
	mw22 = obj.matrix_world[2][2]
	mw23 = obj.matrix_world[2][3]
	mw30 = obj.matrix_world[3][0]
	mw31 = obj.matrix_world[3][1]
	mw32 = obj.matrix_world[3][2]
	mw33 = obj.matrix_world[3][3]
	angle = obj.data.angle
	clip_end = obj.data.clip_end
	clip_start = obj.data.clip_start
	dof_distance = obj.data.dof_distance
	lens = obj.data.lens
	lens_unit = obj.data.lens_unit
	ortho_scale = obj.data.ortho_scale
	shift_x = obj.data.shift_x
	shift_y = obj.data.shift_y
	type = obj.data.type

	cameracode = cameratemplate.substitute(name=name, locx=locx, locy=locy, locz=locz, rotux=rotux, rotuy=rotuy, rotuz=rotuz, ml00=ml00, ml01=ml01, ml02=ml02, ml03=ml03, ml10=ml10, ml11=ml11, ml12=ml12, ml13=ml13, ml20=ml20, ml21=ml21, ml22=ml22, ml23=ml23, ml30=ml30, ml31=ml31, ml32=ml32, ml33=ml33, mw00=mw00, mw01=mw01, mw02=mw02, mw03=mw03, mw10=mw10, mw11=mw11, mw12=mw12, mw13=mw13, mw20=mw20, mw21=mw21, mw22=mw22, mw23=mw23, mw30=mw30, mw31=mw31, mw32=mw32, mw33=mw33, angle=angle, clip_end=clip_end, clip_start=clip_start, dof_distance=dof_distance, lens=lens, lens_unit=lens_unit, ortho_scale=ortho_scale, shift_x=shift_x, shift_y=shift_y, type=type)

	return cameracode

def export_scene(scene):
	
	# get scene header template
	resdir = '/Applications/blender-2.54/blender.app/Contents/MacOS/2.54/scripts/io'
	scenetemplatefile = open(resdir+'/templates_efnx/scene.js', 'r')
	scenetemplate = Template(scenetemplatefile.read())
	scenetemplatefile.close()
	
	name = str.replace(scene.name, '.', '_')
	
	scenecode = scenetemplate.substitute(name=name)
	
	for object in scene.objects:
		if(hasattr(object.data, 'faces')):
			#this object is a mesh
			scenecode += export_model(object)
		elif(hasattr(object.data, 'lens')):
			scenecode += export_camera(object)	
		#elif lamp
	return scenecode

# add the user script path so we can use our external scripts
sys.path.append('/Applications/blender-2.54/blender.app/Contents/MacOS/2.54/scripts/io')


class RENDER_PT_efnx(bpy.types.Panel):
	bl_space_type = "PROPERTIES"
	bl_region_type = "WINDOW"
	bl_context = "render"
	bl_label = "Efnx Exports"
    
	def draw_header(self, context):
		layout = self.layout
		layout.label(text="", icon="PHYSICS")

	def draw(self, context):
		layout = self.layout
		row = layout.row()
		split = row.split(percentage=0.5)
		colL = split.column()
		colR = split.column()
		colL.operator("efnx_isom_exportScene", text="Scene to Webgl")


class RENDER_OT_efnx(bpy.types.Operator):
	bl_label = "Export scene to javascript operator"
	bl_idname = "efnx_isom_exportScene"
	bl_description = "Export scene to javascript"

	def invoke(self, context, event):
		import bpy
		self.report("INFO", "Export initiated ")
		paste(export_scene(bpy.context.scene))
		self.report("INFO", "Javascript copied to clipboard")
		return {"FINISHED"}
		
menu_func = lambda self, context: self.layout.operator(RENDER_OT_efnx.bl_idname, text='Webgl Scene Export to clipboard')

def register():    
    bpy.types.INFO_MT_file_export.append(menu_func)
    
def unregister():
    bpy.types.INFO_MT_file_export.remove(menu_func)

if __name__ == '__main__':
    register()