## 3D Configurator (Frame color)

### Page

- Open: `/configurator`

### Model file

Put your GLB file here:

- `public/models/room.glb`

The configurator loads:

- `/models/room.glb`

### IMPORTANT: mesh naming

To make only the **frame** color change, the model must have separate meshes for frames.

Rules used in code (`libs/components/configurator/RoomConfigurator.tsx`):

- Mesh name contains `frame` (case-insensitive), OR
- Mesh name starts with `frame_`

Examples:

- `Window_01_Frame`
- `Door_02_Frame`
- `FRAME_kitchen_window`

### How it works

- Click inside the 3D scene to lock pointer (first-person style)
- Hover: cursor changes + slight emissive highlight
- Click: selects that frame
- Click a swatch: changes only the selected frame color (material is cloned per mesh)


