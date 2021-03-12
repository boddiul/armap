



import math

import json








def reset():
    global wall_ids,furn_id,nd_fl,door_ids,portal_ids,eid,map_id,mapp
    map_id = -1

    mapp = None

    wall_ids = 0
    furn_id = 0
    nd_fl = {}
    door_ids = 0
    portal_ids = {"staircase":0,"elevator":0}
    eid = 0


def new_floor(id,name):
    global mapp    

    mapp["floors"].append({
        "id":id,
        "name":name,
        "rooms":[],
        "doors":[]
        })
    return



def new_room(floor,_id,name,descr,can_search,dummy_coords,coords):
    global wall_ids
    walls = []
    if (dummy_coords!=None):
        coords = [[dummy_coords[0]+0.05,dummy_coords[1]-0.05],[dummy_coords[2]-0.05,dummy_coords[1]-0.05],[dummy_coords[2]-0.05,dummy_coords[3]+0.05],[dummy_coords[0]+0.05,dummy_coords[3]+0.05]]

       
        
        
    coords.append(coords[0])
    st_wall_ids = wall_ids
    for i in range(0,len(coords)-1):
        walls.append({
            "id":wall_ids,"x1":coords[i][0],"y1":coords[i][1],"x2":coords[i+1][0],"y2":coords[i+1][1],"wall_prev_id":wall_ids-1,"wall_next_id":wall_ids+1})
        wall_ids+=1
    walls[-1]["wall_next_id"]=st_wall_ids


    for f in mapp["floors"]:
        if f["id"] == floor:
            
            f["rooms"].append({
                "id":_id,
                "name":name,
                "description":descr,
                "can_search":can_search,
                "elevators":[],
                "staircases":[],
                "furniture":[],
                "walls":walls,
                #"dummy_walls":[coords[0]+0.05,coords[1]-0.05,coords[2]-0.05,coords[3]+0.05],
                "qrs":[]
                })

    return




def new_furniture(floor_id,room_id,name,coords):
    global furn_id

    
    for f in mapp["floors"]:
        if f["id"] == floor_id:
            for r in f["rooms"]:
                if r["id"]==room_id:
                    r["furniture"].append({
                        "id":furn_id,
                        "name":name,
                        "x1":coords[0],
                        "y1":coords[1],
                        "x2":coords[2],
                        "y2":coords[3]
                        })
                    furn_id+=1




def new_room_node(floor,_id,x,y,room_id):


    mapp["graph"]["nodes"].append({
        "id":_id,
        "floor_id":floor,
        "obj_id":room_id,
        "obj_type":"in_room",
        "x":x,
        "y":y,
        "z":0
        })

    nd_fl[_id] = floor
    
    return




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
        "floor_id":floor,
        "obj_id":door_ids,
        "obj_type":"door",
        "x":x,
        "y":y,
        "z":0
        })

    door_ids+=1
    nd_fl[_id] = floor
    
    return





def new_portal(floor,_id,x,y,portal_type,direction,room_id,wh=[]):
    global portal_ids
    

    aa = direction*math.pi/180

    mapp["graph"]["nodes"].append({
        "id":_id,
        "floor_id":floor,
        "obj_id":portal_ids[portal_type],
        "obj_type":portal_type,
        "direction":aa,
        "x":x,
        "y":y,
        "z":0
        })


    for f in mapp["floors"]:
        if f["id"] == floor:
            for r in f["rooms"]:
                if r["id"]==room_id:
                    if portal_type=='staircase':
                        r["staircases"].append({
                            "id":portal_ids[portal_type],
                            "x":x,
                            "y":y,
                            "direction":aa,
                            "width":wh[0],
                            "height":wh[1]})
                    elif portal_type=='elevator':
                        r["elevators"].append({
                            "id":portal_ids[portal_type],
                            "x":x,
                            "y":y,
                            "direction":aa,
                            "wall_id":-1})
                        
                        
                        
                      

    portal_ids[portal_type]+=1
    
    nd_fl[_id] = floor
    
    return

def new_qr_node(floor,_id,x,y,qr_id,direction):
    mapp["graph"]["nodes"].append({
        "id":_id,
        "floor_id":floor,
        "obj_id":qr_id,
        "obj_type":"qr",
        "direction":direction,
        "x":x,
        "y":y,
        "z":0

        })
    nd_fl[_id] = floor
    return



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





def new_qr(floor,_id,x,y,direction,room,off = 0.05):

    

    aa = direction*math.pi/180

    xx = x-off*(math.cos(aa))
    yy = y-off*(math.sin(aa))


    for f in mapp["floors"]:
        for r in f["rooms"]:
            if r["id"]==room:
                r["qrs"].append( {
                    "id":_id,
                    "x":xx,
                    "y":yy,
                    "z":0,
                    "direction":aa,
                    "wall_id":-1,

                    })



        

    
    return



def qrnodes():
    global mapp,map_id

    def ccw(A,B,C):
        return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0])

    def intersect(A,B,C,D):
        return ccw(A,C,D) != ccw(B,C,D) and ccw(A,B,C) != ccw(A,B,D)



    l_node_id = 40
    for f in mapp["floors"]:
        for r in f["rooms"]:
            for q in r["qrs"]:
                l_node_id+=1


                print(l_node_id)


                aa = q["direction"]

                xx = q["x"]-0.2*(math.cos(aa))
                yy = q["y"]+0.2*(-math.sin(aa))
                new_qr_node(f["id"],l_node_id,xx,yy,q["id"],aa)

                ok_node_id = []

                for n in mapp["graph"]["nodes"]:

                    #print(l_node_id,n["id"])   
                    if n["obj_type"]=="door" or n["obj_type"]=="elevator" or n["obj_type"]=="staircase":

                        ye = False
                        for e in mapp["graph"]["edges"]:
                            n1_id = e["node1_id"]
                            n2_id = e["node2_id"]

                            if (map_id==33 and (n1_id == 5 or n2_id == 5)):
                                continue
                            
                            if (map_id==33 and (n1_id == 6 or n2_id == 6)):
                                continue

                            if (map_id==220 and (n1_id == 24 or n2_id == 24) and q["direction"]<math.pi):
                                continue

                            no_id = -1
                            if n1_id == n["id"]:
                                no_id = n2_id
                            if n2_id == n["id"]:
                                no_id = n1_id
                                

                            
                            if no_id!=-1:
                                for nn in mapp["graph"]["nodes"]:
                                    if nn["id"]==no_id and nn["obj_type"]=="in_room" and nn["obj_id"]==r["id"] and nn["floor_id"]==n["floor_id"]:
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


                ii = 0
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

                            if (n1["floor_id"]==n2["floor_id"] and n1["floor_id"]==f["id"]):
                                if intersect([xx,yy],[o[2],o[3]],[n1["x"],n1["y"]],[n2["x"],n2["y"]]):
                                    #print('INTERSECT',l_node_id,o[0],n1["id"],n2["id"])
                                    ye = False
                                    

                    if ye:
                        #print(l_node_id,o[0])
                        ii+=1

                        if (map_id==33 and ii>2):
                            continue
                        new_edge(l_node_id,o[0])


def saveMap():
    global mapp,map_id
    with open("map"+str(map_id)+".json", "w",encoding='utf8') as data_file:
        json.dump(mapp, data_file, indent=2, sort_keys=False,ensure_ascii=False)


def build220():
    global mapp, map_id


    map_id = 220

    mapp = {"name":"Тестовое здание",
            "id":map_id,
            "description":"Карта тестового несуществующего строения",
            "address":"Покровский б-р, 11, Москва, Россия",            
            "floors":[],
            "graph":{"nodes":[],"edges":[]}
            
            
            }

    new_floor(0,'Этаж 1')
    new_floor(1,'Этаж 2')
    new_floor(2,'Этаж 3')

    new_room(0,3,'Главный вход','Помещение с главным входом',True,[4,8,8,2],None)
    new_room(0,2,'Проход','',False,[1,9,4,2],None)
    new_room(0,0,'Крутая комната','Какая-то комната',True,[1,15,4,9],None)
    new_room(0,1,'Холл на первом этаже','Холл',True,[4,15,12,8],None)
    new_room(0,4,'Лестничная площадка','',False,[8,8,12,2],None)


    new_furniture(0,3,'Шкаф',[7,7.75,7.75,6])
    new_furniture(0,1,'Стол',[7,13,9,10])



    new_room_node(0,    0,  8,      14,     1)
    new_room_node(0,    1,  2.5,    12,     0)

    new_door_node(0,    2,  4,      12,0,1,0)

    new_room_node(0,    3,  5.5,    11.5,   1)
    new_room_node(0,    4,  10.5,   11.5,   1)
    new_portal(0,       5,  12,     12,     'elevator',0,1)

    new_door_node(0,    6,  2.5,    9,0,2,270)
    new_door_node(0,    7,  4.5,    8,1,3,270)

    new_room_node(0,    8,  8,      9,      1)

    new_door_node(0,    9,  10,     8,1,4,270)

    new_room_node(0,    10, 2.5,    5.5,    2)

    new_door_node(0,    11, 4,      5,2,3,0)

    new_room_node(0,    12, 6,      5,      3)
    new_room_node(0,    13, 9.5,    5.5,    4)
    new_portal(0,       14, 11,     6,      'staircase',270,4,[1,2.5])

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




    new_room(1,5,'Кабинет','Главный кабинет',True,[1,15,6,2],None)
    new_room(1,6,'Холл на втором этаже','Холл',True,[6,15,12,8],None)
    new_room(1,7,'Лестничная площадка','',False,[6,8,12,2],None)

    new_door_node(1,    16, 6,      12,5,6,0)

    new_room_node(1,    17, 9,      12,     6)
    new_portal(1,       18, 12,     12,     'elevator',0,6)
    new_room_node(1,    19, 3.5,    8.5,    5)

    new_door_node(1,    20, 9,      8,7,6,90)

    new_room_node(1,    21, 9,      7,      7)
    new_room_node(1,    22, 7.5,    5,      7)
    new_room_node(1,    23, 9,      2.5,    7)
    new_portal(1,       24, 10,     3,      'staircase',90,7,[2,2.5])


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









    new_room(2,8,'Склад','Главный склад',True,[1,15,6,2],None)

    zz = 0.05
    new_room(2,9,'Холл на третьем этаже','Холл',True,None,[[6+zz+2,15-zz],[12-zz,15-zz],[12-zz,8+zz],[6+zz,8+zz],[6+zz,15-zz-2]])
    new_room(2,10,'Лестничная площадка','',False,[6,8,12,2],None)

    new_door_node(2,    25, 6,      12,8,9,0)

    new_room_node(2,    26, 9,      12,     9)
    new_portal(2,       27, 12,     12,     'elevator',0,9)
    new_room_node(2,    28, 3.5,    8.5,    8)

    new_door_node(2,    29, 9,      8,9,10,270)

    new_room_node(2,    30, 9,      7,      10)
    new_portal(2,       31, 9,      6,      'staircase',270,10,[1,2.5])
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
    new_edge(14,24)
    new_edge(24,31)



def build22():
    global mapp,map_id
    map_id = 22

    mapp = {"name":"Тестовое здание 2",
            "id":map_id,
            "description":"Карта тестового несуществующего строения но с одним этажом",
            "address":"Покровский б-р, 11, Москва, Россия",            
            "floors":[],
            "graph":{"nodes":[],"edges":[]}
            
            
            }

    new_floor(0,'Этаж 1')

    new_room(0,3,'Главный вход','Помещение с главным входом',True,[4,8,8,2],None)
    new_room(0,2,'Проход','',False,[1,9,4,2],None)
    new_room(0,0,'Крутая комната','Какая-то комната',True,[1,15,4,9],None)
    new_room(0,1,'Холл на первом этаже','Холл',True,[4,15,12,8],None)
    new_room(0,4,'Лестничная площадка','',False,[8,8,12,2],None)


    new_furniture(0,3,'Шкаф',[7,7.75,7.75,6])
    new_furniture(0,1,'Стол',[7,13,9,10])



    new_room_node(0,    0,  8,      14,     1)
    new_room_node(0,    1,  2.5,    12,     0)

    new_door_node(0,    2,  4,      12,0,1,0)

    new_room_node(0,    3,  5.5,    11.5,   1)
    new_room_node(0,    4,  10.5,   11.5,   1)
    new_portal(0,       5,  12,     12,     'elevator',0,1)

    new_door_node(0,    6,  2.5,    9,0,2,270)
    new_door_node(0,    7,  4.5,    8,1,3,270)

    new_room_node(0,    8,  8,      9,      1)

    new_door_node(0,    9,  10,     8,1,4,270)

    new_room_node(0,    10, 2.5,    5.5,    2)

    new_door_node(0,    11, 4,      5,2,3,0)

    new_room_node(0,    12, 6,      5,      3)
    new_room_node(0,    13, 9.5,    5.5,    4)
    new_portal(0,       14, 11,     6,      'staircase',270,4,[1,2.5])

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

def build33():
    global mapp,map_id
    map_id = 33

    mapp = {"name":"Квартира Тимура 1",
            "id":map_id,
            "description":"Квартира для тестирования приложения 1",
            "address":"Москва, Россия",            
            "floors":[],
            "graph":{"nodes":[],"edges":[]}
            
            }

    new_floor(0,'Этаж 0')

    new_room(0,0,'Балкон','Место для отдыха',True,None,[[1,6.98],[1.93,6.98],[1.93,1],[1,1]])
    new_room(0,1,'Комната','Главная комната для тестирования',True,None,[[2.02,6.98],[7.88,6.98],[7.88,4.38],[6.18,4.38],[6.18,3.44],[2.02,3.44]])
    new_room(0,2,'Кухня','Помещение для еды',True,None,[[2.02,3.35],[6.18,3.35],[6.18,1],[2.02,1]])


    new_room_node(0,    0,  3.3,      5.5,     1)
    new_room_node(0,    1,  6.44,      5.5,     1)
    new_room_node(0,    2,  4.8,      4.3,     1)
    new_room_node(0,    3,  6.17,      4.5,     1)

    new_room_node(0,    4,  1.5,      2.0,     0)

    #new_door_node(0,    5,  5.7,      3.4,     1,2,270)
    #new_door_node(0,    6,  1.97,      2.2,     0,2,0)

    new_door_node(0, 6,1.97,6.98-1.5,0,1,0)
    #new_room_node(0,    7,  4,      2.3,     2)



    new_edge(0,2)
    new_edge(2,1)
    new_edge(1,3)
    #new_edge(3,5)
    new_edge(2,3)
    #new_edge(2,5)

    #new_edge(5,7)
    #new_edge(6,7)
    #new_edge(6,5)
    new_edge(6,0)
    new_edge(6,4)


    new_edge(4,6)


    new_qr(0,           0,  4.76,      6.0,     90,      1,0)
    new_qr(0,           1,  2.95,      3.44,     270,      1,0)
    new_qr(0,           2,  7.88,      5.3,   0,    1,0)
    new_qr(0,           3,  1+0.93/2,      1,   270,    0,0)
    

    new_furniture(0,1,'Диван',[3.5,6.9,5.6,5.9])
    new_furniture(0,1,'Стол',[7.3,6.9,7.8,5.5])
    new_furniture(0,1,'Столик',[4.3,5.7,5,5])
    new_furniture(0,1,'Стол',[2.1,5,2.8,3.5])
    new_furniture(0,1,'Стол',[3.7,3.9,5.2,3.5])
    new_furniture(0,1,'Стул',[7.4,5.2,7.8,4.8])




def build34():
    global mapp,map_id
    map_id = 34

    mapp = {"name":"Комната Тимура 1",
            "id":map_id,
            "description":"Комната для тестирования приложения 1",
            "address":"Москва, Россия",            
            "floors":[],
            "graph":{"nodes":[],"edges":[]}
            
            }

    new_floor(0,'Этаж 0')



    ww = 1
    x = 4.76-0.5
    y = 6.0
    new_room(0,0,'Диван','',True,None,[[x-1,y],[x+1,y],[x+1,y-ww],[x-1,y-ww]])
    new_qr(0,0,x,y,90,0,0)
    new_qr_node(0,0,x,y-0.1,0,90*math.pi/180)
    

    x = 2.95
    y = 3.44
    new_room(0,1,'Стол','',True,None,[[x-1,y],[x+1,y],[x+1,y+ww],[x-1,y+ww]])
    new_qr(0,1,x,y,270,1,0)
    new_qr_node(0,1,x,y+0.1,1,270*math.pi/180)

    x = 7.88
    y = 5.3
    new_room(0,2,'Картина','',True,None,[[x-ww,y+1],[x,y+1],[x,y-1],[x-ww,y-1]])
    new_qr(0,2,x,y,0,2,0)
    new_qr_node(0,2,x-0.1,y,2,0)


    
    new_edge(0,1)
    new_edge(2,1)
    new_edge(0,2)




def build35():
    global mapp,map_id
    map_id = 35

    mapp = {"name":"Квартира Тимура 2",
            "id":map_id,
            "description":"Квартира для тестирования приложения 1",
            "address":"Москва, Россия",            
            "floors":[],
            "graph":{"nodes":[],"edges":[]}
            
            }

    new_floor(0,'Этаж 0')

    new_room(0,3,'Балкон','Место для отдыха',True,None,[[1,6.98],[1.93,6.98],[1.93,1],[1,1]])
    new_room(0,2,'Картина','Главная комната для тестирования',True,None,[[6.18,6.98],[7.88,6.98],[7.88,4.38],[6.18,4.38]])
    new_room(0,1,'Стол','Главная комната для тестирования',True,None,[[2.02,6.98],[3.95,6.98],[3.95,3.44],[2.02,3.44]])
    new_room(0,0,'Диван','Главная комната для тестирования',True,None,[[4,6.98],[6,6.98],[6,3.44],[4,3.44]])



    new_room_node(0,    4,  3.1,      5.5-1.7,     1)
    new_room_node(0,    5,  6.44+1,      5.5,     2)
    #new_room_node(0,    6,  4.8,      4.3,     0)
    #new_room_node(0,    7,  6.17,      4.5,     2)

    new_room_node(0,    7,  4.5,      5.7,     0)

    new_room_node(0,    8,  1.5,      1.5,     3)


    new_door_node(0, 9,1.97,6.98-1.5,3,1,0)






    x = 4.76-0.5
    y = 6.0
    new_qr(0,0,x,y,90,0,0)
    new_qr_node(0,0,x,y-0.1,0,90*math.pi/180)
    

    x = 2.95
    y = 3.44
    new_qr(0,1,x,y,270,1,0)
    new_qr_node(0,1,x,y+0.1,1,270*math.pi/180)

    x = 7.88
    y = 5.3
    new_qr(0,2,x,y,0,2,0)
    new_qr_node(0,2,x-0.1,y,2,0)

    x = 1+0.93/2
    y = 1
    new_qr(0,           3,  x,      y,   270,    3,0)
    new_qr_node(0,3,x,y+0.1,3,0) 



    new_edge(0,7)
    new_edge(1,4)
    new_edge(2,5)
    new_edge(3,8)    


    new_edge(4,7)
    #new_edge(4,6)
    new_edge(4,9)
    
    new_edge(5,7)
    #new_edge(5,6)

    new_edge(9,8)
    new_edge(9,4)

    new_edge(9,7)  
    


reset()
build33()
qrnodes()
saveMap()


reset()
build34()
saveMap()

reset()
build35()
saveMap()


reset()
build22()
qrnodes()
saveMap()

reset()
build220()
qrnodes()
saveMap()

            
            




