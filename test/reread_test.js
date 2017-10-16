var test = require('tap').test
var broccoli = require('..')
var Builder = broccoli.Builder

class DummyTree  {
    constructor() {
        this.roots = [];
    }
    reread(newRoot) {
        this.roots.push(newRoot);
    }
}

class SubTree {
    constructor(tree) {
        this._tree = tree;
    }
    read(readtree) {
        if(!this.in) {
            this.in = [this._tree]
            this._inputNodes = [{}]
        }
        this._inputNodes[0].outputPath =  `path${this._tree.roots.length}`;
        return 'foo'
    }
}

test('reread is called only once for 2 different nodes with same FacadeTree in a build', function (t) {
    const dummyTree= new DummyTree();
    const subTree1 = new SubTree(dummyTree);
    const subTree2 = new SubTree(dummyTree);

    var builder = new Builder({ read : function(readtree) {
     return  readtree(subTree1).then(() => {
          return readtree(subTree2)
       })
     }
    });

    builder.build().then(function (hash) {
        t.equal(dummyTree.roots.length, 0);
        return builder.build()
    }).then(function (hash) {
        t.equal(dummyTree.roots.length, 1);
        t.equal(dummyTree.roots[0], 'path0');
        t.end();
    })
});

test('reread is called only once for same node in a build', function (t) {
    const dummyTree1 = new DummyTree();
    const subTree1 = new SubTree(dummyTree1);

    var builder = new Builder({ read : function(readtree) {
     return  readtree(subTree1).then(() => {
          return readtree(subTree1)
       })
     }
    });

    builder.build().then(function (hash) {
        t.equal(dummyTree1.roots.length, 0);
        return builder.build()
    }).then(function (hash) {
        t.equal(dummyTree1.roots.length, 1);
        t.equal(dummyTree1.roots[0], 'path0');
        t.end();
    })
});
