



import math

import json



mapp = {"name":"Тестовое здание",
        "id":220,
        "description":"Карта тестового несуществующего строения",
        "address":"Покровский б-р, 11, Москва, Россия",            
        "floors":[],
        "graph":{"nodes":[],"edges":[]}
        
        
        }




def new_floor(id,name):

    mapp["floors"].append({
        "id":id,
        "name":name,
        "rooms":[],
        "doors":[]
        })
    return

def new_room(floor,_id,name,descr,can_search,coords):



    for f in mapp["floors"]:
        if f["id"] == floor:
            
            f["rooms"].append({
                "id":_id,
                "name":name,
                "description":descr,
                "can_search":can_search,
                "elevators":[],
                "staircases":[],
                "walls":[],
                "dummy_walls":[coords[0]+0.05,coords[1]-0.05,coords[2]-0.05,coords[3]+0.05],
                "qrs":[]
                })

    return


nd_fl = {}

def new_room_node(floor,_id,x,y,room_id):


    mapp["graph"]["nodes"].append({
        "id":_id,
        "dummy_floor_id":floor,
        "obj_id":room_id,
        "obj_type":"in_room",
        "x":x,
        "y":y,
        "z":0
        })

    nd_fl[_id] = floor
    
    return


door_ids = 0

def new_door_node(floor,_id,x,y,r1,r2,direction):
    global door_ids

    k=0.05
    aa = direction*math.pi/180

    for f in mapp["floors"]:
        if f["id"]==floor:
            f["doors"].append({
                "id":door_ids,
                "x1":x-k*math.cos(aa),
                "x2":x+k*math.cos(aa),
                "y1":y-k*math.sin(aa),
                "y2":y+k*math.sin(aa),
                "width":0.9,
                "wall1_id":-1,
                "wall2_id":-1,
                "room1_id":r1,
                "room2_id":r2
                })

    mapp["graph"]["nodes"].append({
        "id":_id,
        "dummy_floor_id":floor,
        "obj_id":door_ids,
        "obj_type":"door",
        "x":x,
        "y":y,
        "z":0
        })

    door_ids+=1
    nd_fl[_id] = floor
    
    return



portal_ids = {"staircase":0,"elevator":0}

def new_portal(floor,_id,x,y,portal_type):

    

    mapp["graph"]["nodes"].append({
        "id":_id,
        "dummy_floor_id":floor,
        "obj_id":-1,
        "obj_type":portal_type,
        "x":x,
        "y":y,
        "z":0
        })
    nd_fl[_id] = floor
    
    return

def new_qr_node(floor,_id,x,y,qr_id):
    mapp["graph"]["nodes"].append({
        "id":_id,
        "dummy_floor_id":floor,
        "obj_id":qr_id,
        "obj_type":"qr",
        "x":x,
        "y":y,
        "z":0

        })
    nd_fl[_id] = floor
    return


eid = 0

def new_edge(id1,id2):
    global eid
    



    o1 = -1
    floor1 = -1

    o2 = -1
    floor2 = -1

    for n in mapp["graph"]["nodes"]:
        if n["id"] == id1:
            o1 = n
            floor1 = nd_fl[id1]
        if n["id"] == id2:
            o2 = n
            floor2 = nd_fl[id2]

        


    t = 0
    
    if (floor1==floor2):

        dist = math.sqrt( ((o2["x"]-o1["x"])**2)+((o2["y"]-o1["y"])**2) )
    
        t = dist*2
        
        
        
    else:

        if (o1["obj_type"]=="elevator"):

            t = 20
            
        else:
            t = 15
            


    mapp["graph"]["edges"].append({
        "id":eid,
        "node1_id":id1,
        "node2_id":id2,
        "weight":t
        })

    eid+=1

    
    return

#def new_portal_edge(floor1,id1,floor2,id2,travel_time)
#    return





def new_qr(floor,_id,x,y,direction,room):



    aa = direction*math.pi/180

    xx = x-0.05*(math.cos(aa))
    yy = y-0.05*(math.sin(aa))


    for f in mapp["floors"]:
        for r in f["rooms"]:
            if r["id"]==room:
                r["qrs"].append( {
                    "id":_id,
                    "x":xx,
                    "y":yy,
                    "z":0,
                    "direction":direction,
                    "wall_id":-1,

                    })



        

    
    return





new_floor(0,'Этаж 1')
new_floor(1,'Этаж 2')
new_floor(2,'Этаж 3')

new_room(0,3,'Главный вход','Помещение с главным входом',True,[4,8,8,2])
new_room(0,2,'Проход','',False,[1,9,4,2])
new_room(0,0,'Крутая комната','Какая-то комната',True,[1,15,4,9])
new_room(0,1,'Холл на первом этаже','Холл',True,[4,15,12,8])
new_room(0,4,'Лестничная площадка','',False,[8,8,12,2])




new_room_node(0,    0,  8,      14,     1)
new_room_node(0,    1,  2.5,    12,     0)

new_door_node(0,    2,  4,      12,0,1,0)

new_room_node(0,    3,  6.5,    11.5,   1)
new_room_node(0,    4,  10.5,   11.5,   1)
new_portal(0,       5,  12,     12,     'elevator')

new_door_node(0,    6,  2.5,    9,0,2,270)
new_door_node(0,    7,  4.5,    8,1,3,270)

new_room_node(0,    8,  8,      9,      1)

new_door_node(0,    9,  10,     8,1,4,270)

new_room_node(0,    10, 2.5,    5.5,    2)

new_door_node(0,    11, 4,      5,2,3,0)

new_room_node(0,    12, 6,      5,      3)
new_room_node(0,    13, 9.5,    5.5,    4)
new_portal(0,       14, 11,     6,      'staircase')

new_door_node(0,    15, 5.5,    2,-1,3,90)


new_edge(1,2)
new_edge(1,6)
new_edge(2,6)
new_edge(2,3)
new_edge(2,7)
new_edge(7,3)
new_edge(3,0)
new_edge(3,8)
new_edge(0,4)
new_edge(4,5)
new_edge(4,8)
new_edge(4,9)
new_edge(8,9)
new_edge(7,8)
new_edge(6,10)
new_edge(6,11)
new_edge(10,11)
new_edge(11,12)
new_edge(11,15)
new_edge(7,12)
new_edge(7,11)
new_edge(12,15)
new_edge(9,13)
new_edge(9,14)
new_edge(13,14)



new_qr(0,           11,  7,      2,      270,     3)

new_qr(0,           0,  4,      13.5,   180,    1)
new_qr(0,           1,  4,      11,     0,      0)
new_qr(0,           2,  1.5,    9,      270,    0)
new_qr(0,           3,  12,     9.5,    0,      1)
new_qr(0,           4,  3.5,    9,      90,     2)
new_qr(0,           5,  4.25,   8,      270,    1)
new_qr(0,           6,  8.5,    8,      270,    1)
new_qr(0,           7,  6.5,      8,      90,   3)
new_qr(0,           8,  11,      8,      90,    4)
new_qr(0,           9,  4,      6,      180,    3)
new_qr(0,           10,  4,      4,      0,     2)




new_room(1,5,'Кабинет','Главный кабинет',True,[1,15,6,2])
new_room(1,6,'Холл на втором этаже','Холл',True,[6,15,12,8])
new_room(1,7,'Лестничная площадка','',False,[6,8,12,2])

new_door_node(1,    16, 6,      12,5,6,0)

new_room_node(1,    17, 9,      12,     6)
new_portal(1,       18, 12,     12,     'elevator')
new_room_node(1,    19, 3.5,    8.5,    5)

new_door_node(1,    20, 9,      8,7,6,90)

new_room_node(1,    21, 9,      7,      7)
new_room_node(1,    22, 7.5,    5,      7)
new_room_node(1,    23, 9,      2.5,    7)
new_portal(1,       24, 10,     3,      'staircase')


new_edge(19,16)
new_edge(16,17)
new_edge(17,18)
new_edge(16,20)
new_edge(17,20)
new_edge(18,20)
new_edge(20,21)
new_edge(21,22)
new_edge(22,24)
new_edge(23,24)


new_qr(1,           12,  6,     13,     180,      6)
new_qr(1,           13,  6,     11,     0,      5)
new_qr(1,           14,  12,    10.5,   0,      6)
new_qr(1,           15,  8,     8,      270,      6)
new_qr(1,           16,  10,    8,      90,     7)
new_qr(1,           17,  10,    2,      270,      7)









new_room(2,8,'Склад','Главный склад',True,[1,15,6,2])
new_room(2,9,'Холл на третьем этаже','Холл',True,[6,15,12,8])
new_room(2,10,'Лестничная площадка','',False,[6,8,12,2])

new_door_node(2,    25, 6,      12,8,9,0)

new_room_node(2,    26, 9,      12,     9)
new_portal(2,       27, 12,     12,     'elevator')
new_room_node(2,    28, 3.5,    8.5,    8)

new_door_node(2,    29, 9,      8,9,10,270)

new_room_node(2,    30, 9,      7,      10)
new_portal(2,       31, 9,      6,      'staircase')
new_room_node(2,    32, 7.5,    5,      10)
new_room_node(2,    33, 11,     5,      10)
new_room_node(2,    34, 9,      2.5,    10)




new_edge(28,25)
new_edge(25,26)
new_edge(26,27)
new_edge(29,25)
new_edge(29,26)
new_edge(29,27)

new_edge(29,30)
new_edge(30,32)
new_edge(30,33)
new_edge(30,31)
new_edge(32,31)
new_edge(33,31)
new_edge(34,32)
new_edge(34,33)


new_qr(2,           18,  7,     14,     135,      9)
new_qr(2,           19,  6,     11,     0,      8)
new_qr(2,           20,  12,    10.5,   0,      9)
new_qr(2,           21,  8,     8,      270,      9)
new_qr(2,           22,  10,    8,      90,     10)



new_edge(5,18)
new_edge(18,27)
new_edge(14,23)
new_edge(23,31)



def ccw(A,B,C):
    return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0])

def intersect(A,B,C,D):
    return ccw(A,C,D) != ccw(B,C,D) and ccw(A,B,C) != ccw(A,B,D)



l_node_id = 34
for f in mapp["floors"]:
    for r in f["rooms"]:
        for q in r["qrs"]:
            l_node_id+=1


            print(l_node_id)


            aa = q["direction"]*math.pi/180

            xx = q["x"]-0.2*(math.cos(aa))
            yy = q["y"]+0.2*(-math.sin(aa))
            new_qr_node(f["id"],l_node_id,xx,yy,q["id"])

            ok_node_id = []

            for n in mapp["graph"]["nodes"]:

                #print(l_node_id,n["id"])   
                if n["obj_type"]=="door" or n["obj_type"]=="elevator" or n["obj_type"]=="staircase":

                    ye = False
                    for e in mapp["graph"]["edges"]:
                        n1_id = e["node1_id"]
                        n2_id = e["node2_id"]

                        no_id = -1
                        if n1_id == n["id"]:
                            no_id = n2_id
                        if n2_id == n["id"]:
                            no_id = n1_id
                            

                        
                        if no_id!=-1:
                            for nn in mapp["graph"]["nodes"]:
                                if nn["id"]==no_id and nn["obj_type"]=="in_room" and nn["obj_id"]==r["id"] and nn["dummy_floor_id"]==n["dummy_floor_id"]:
                                    ye = True


                    if ye:
                        ok_node_id.append([n["id"],math.sqrt((n["x"]-xx)**2 + (n["y"]-yy)**2),n["x"],n["y"]])

 
                                
                        
                        
                    
                elif n["obj_type"]=="in_room" and n["obj_id"]==r["id"]:
                    #nx = n["x"]
                    #ny = n["y"]
                    #new_edge(n["id"],l_node_id)
                    ok_node_id.append([n["id"],math.sqrt((n["x"]-xx)**2 + (n["y"]-yy)**2),n["x"],n["y"]])

            #print(ok_node_id)

            
            #for o in sorted(ok_node_id, key=lambda s: s[1])[:2]:
            #    new_edge(l_node_id,o[0])


            for o in ok_node_id:
                ye = True
                for e in mapp["graph"]["edges"]:
                    n1_id = e["node1_id"]
                    n2_id = e["node2_id"]
                    if n1_id!=o[0] and n2_id!=o[0] and n1_id!=l_node_id and n2_id!=l_node_id:
                        n1 = None
                        n2 = None
                        for nn in mapp["graph"]["nodes"]:
                            if nn["id"]==n1_id:
                                n1 = nn
                            if nn["id"]==n2_id:
                                n2 = nn

                        if (n1["dummy_floor_id"]==n2["dummy_floor_id"] and n1["dummy_floor_id"]==f["id"]):
                            if intersect([xx,yy],[o[2],o[3]],[n1["x"],n1["y"]],[n2["x"],n2["y"]]):
                                #print('INTERSECT',l_node_id,o[0],n1["id"],n2["id"])
                                ye = False
                                

                if ye:
                    #print(l_node_id,o[0])
                    new_edge(l_node_id,o[0])
            
            

print(mapp)

with open("map220.json", "w",encoding='utf8') as data_file:
    json.dump(mapp, data_file, indent=2, sort_keys=False,ensure_ascii=False)


