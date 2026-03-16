Design a professional **industrial web application UI** for **Construction Site Safety Monitoring (HSE)** using **Computer Vision, fixed cameras, drones, and GIS mapping (Leaflet)**.

The system is used in **road construction sites** to monitor safety risks in real time. Cameras, drones, and mobile photos analyze the site using **AI object detection** to identify workers, machines, PPE equipment, and safety violations.

Detected risks include:

* missing PPE (helmet, vest, gloves)
* unsafe distance between workers and machines
* access to dangerous or restricted zones

The application is used by **HSE managers, safety supervisors, and site managers**. The interface should resemble a **professional industrial monitoring dashboard** similar to **video surveillance systems, smart city monitoring platforms, or IoT control centers**.

Use a **modern dashboard layout** with:

* left sidebar navigation
* top header
* large map views
* video monitoring panels
* data tables
* alert cards

The application contains the following main interfaces:

1. **Main Dashboard**
   Global overview of safety status.
   Include:

* safety statistics (workers detected, machines detected, violations today)
* recent alerts feed
* small construction site map preview
* camera live preview panels
* quick safety indicators.

2. **Construction Site Map (GIS Map)**
   Main interface based on an interactive **Leaflet map** representing the construction site.

Map features:

* show cameras locations
* show drones positions
* show workers and machines detected
* show incidents and alerts

Provide drawing tools for supervisors:

* draw polygon
* draw line
* draw point
* edit and delete shapes

Users can create safety zones such as:

* dangerous zones
* restricted areas
* PPE mandatory zones
* vehicle circulation zones
* pedestrian zones

Each zone contains:

* zone name
* zone type
* assigned HSE safety rules.

3. **Camera Monitoring Interface**
   Manage all fixed cameras installed on the construction site.

Show a table with:

* camera name
* location
* orientation
* status

Selecting a camera opens a **live monitoring screen** displaying AI detection overlays:

* workers
* helmets
* safety vests
* vehicles and machines
* real-time distance measurement between worker and machine.

4. **Drone Mission Management**
   Interface for drone inspection missions.

Include:

* mission list (zone, date, status)
* mission planning on the map
* drone flight path definition

Mission results display captured images and detected safety anomalies.

5. **Field Photo Inspection**
   Safety agents can upload or capture photos from the construction site.

The system automatically performs AI analysis and displays:

* detected workers
* PPE detection results
* violations
* GPS location on the map.

6. **HSE Rules Management**
   Interface to configure safety rules used by the detection system.

Rules include:

* PPE rules (helmet, vest, gloves required)
* distance rules between workers and machines
* zone access restrictions

Each rule contains:

* rule name
* rule type
* threshold values
* associated zones.

7. **Real-Time Alerts**
   List of safety violations detected by AI.

Each alert contains:

* time
* violation type
* camera source
* zone location
* severity level

Clicking an alert opens detailed information including image snapshot, video clip, and map location.

8. **Incident Management**
   Convert alerts into safety incidents.

Incident page includes:

* incident ID
* violation type
* location
* related images or videos
* assigned safety officer
* resolution status.

9. **Safety Reports and Analytics**
   Analytics dashboards showing:

* violations per day
* violations per zone
* violations by type
* most dangerous areas.

10. **System Configuration**
    Admin interface for configuring:

* construction site map
* cameras
* drones
* users and permissions.

Design style:
Industrial monitoring platform with clean professional UI, dashboards, map-centric layout, clear alert colors (red, yellow, green), and components such as cards, tables, charts, and video panels.
