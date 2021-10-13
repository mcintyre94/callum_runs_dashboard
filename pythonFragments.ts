// This Typescript app has a bunch of Python fragments. Totally normal. Here they are!

// Python code that is preloaded before the user's code is run
// <- [reference](https://stackoverflow.com/a/59571016/1375972)
export const preloadMatplotlibCode =
`import matplotlib.pyplot as plt
from js import document
f = plt.figure()
f.suptitle('above')
def get_render_element(self):
    return document.getElementById('plot')
f.canvas.create_root_element = get_render_element.__get__(
    get_render_element, f.canvas.__class__
)`

export const defaultGraphCode =
`import matplotlib.pyplot as plt
x = [d['datetime'] for d in data]
y = [d['distance_km'] for d in data]
plt.scatter(x, y)
plt.title('Distance Ran!')
plt.ylabel('Distance (km)')
plt.show()`

export const preloadData = (data: Object[]) =>
`from datetime import datetime
import json
data = json.loads('${JSON.stringify(data)}')
for d in data:
    dt = datetime.fromtimestamp(int(d["timestamp"]))
    d["datetime"] = dt
`

export const clearGraph = `plt.clf()`