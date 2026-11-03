# Classy MovieDB API Wrapper
## Classes
### Generic Class Methods
| Method Tags                       | Method Name &amp; Params |
|:---------------------------------:|:------------------------ |
|                                   | `constructor({data})`    |
|                                   | `assignData({data})`     |
|                                   | `toJSON( )`              |
| <kbd>STATIC</kbd>                 | `parseFromAPI({data})`   |
| <kbd>STATIC</kbd>                 | `parseFromDB({data})`    |
| <kbd>STATIC</kbd>                 | `matches(...instances)`  |
| <kbd>STATIC</kbd>                 | `combine(...instances)`  |
| <kbd>PRIVATE</kbd> <kbd>GET</kbd> | `sharedMetadata( )`      |

#### `constructor(data)`
This method is a typical JavaScript class instance constructor function.
It can take in a well-formatted, JSON-compatible data object, which is consumed by `assignData`.
In this case, the class returns a new class instance from the data.

The constructor can also take in an instance of its own class as its data.
When this happens, the constructor does nothing else and returns the input instance instead of creating a new one.

#### `assignDefaults( )`
This method is ran from within the constructor.
It sets default values to the instance's various attributes.
Valid default values for class instances include:
- `undefined`
- empty `Array` instances
- empty `List` instances
- key-value data `Objects`, containing further valid default values

#### `assignData({data})`
This method is ran from within the constructor, or called upon when there is new data.
It takes a well-formatted, JSON-compatible data object and applies it to the class instance and its various attributes.
A well-formatted, JSON-compatible data object is output by the `toJSON`, `parseFromAPI`, and `parseFromDB` static methods.

#### <kbd>PRIVATE</kbd> <kbd>GET</kbd> `sharedMetadata`
Hidden data that can be used by child elements.

#### <kbd>STATIC</kbd> `toJSON( )`
Consumes a class instance, and returns a well-formatted, JSON-compatible data object.

#### <kbd>STATIC</kbd> `parseFromApi({data})`
Consumes API data, and returns a well-formatted, JSON-compatible data object.

#### <kbd>STATIC</kbd> `parseFromDb({data})`
Consumes DB data, and returns a well-formatted, JSON-compatible data object.

#### <kbd>STATIC</kbd> `matches(...instances)`
Checks if one or more given instances are matching.
Returns `true` if all items match.
Returns `false` if any of the items do not match, or if there are no items.
Also returns `false` if any the items are not an instance of this class.

#### <kbd>STATIC</kbd> `combine(...instances)`
Combines one or more matching instances into a singular item.
First, the method leverages the `matches` method to see if all the given items match.
The method can then returns a new instance of the combined elements if they all match.
Othewise, it returns `false`.
