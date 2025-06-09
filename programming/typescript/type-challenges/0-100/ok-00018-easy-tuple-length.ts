// 创建一个通用的Length，接受一个readonly的数组，返回这个数组的长度。

// 例如：

type tesla = ['tesla', 'model 3', 'model X', 'model Y']
type spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT']

type Length2<T extends any[]> = T["length"]
type Length1<T extends any> = T extends {length:infer L} ? L:never;

type Length<T extends any[]> = Length1<T>


type teslaLength = Length<tesla> // expected 4
type spaceXLength = Length<spaceX> // expected 5