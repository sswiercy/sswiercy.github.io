problem.list = [
	new problem.Group(
		"Introduction",
		"I",
		[
			new problem.Statement(
				"The Editor",
				"<p>In this tutorial you will learn how to use the <em>program editor</em>. This is the area with the light background below, as opposed to the dark background here, which belongs to tutorials and problem descriptions. The program editor allows you to write, compile and run your programs as well as to store and restore them. Continue with tutorial {PROBLEM:Symbols} to get a first introduction to the programming language. Use this tutorial here as a manual on how to use the editor. It follows a detailed description of each input element of the editor. A brief tooltip is also available for some of them.</p><table><tr><th>Resize</th><td>Adjusts the heights of the textareas <em>Definitions</em> and <em>Expression</em> to fit their content, so no vertical scrolling bars should appear on the right border of those textareas.</td></tr><tr><th>Clear</th><td>Clears all input elements to prepare the editor for writing a new program.</td></tr><tr><th>Save</th><td>Stores the current program using the name typed into the input field to the left of this button. It includes both <em>Definitions</em> and <em>Expression</em>. The name must consist of at least one non-whitespace character. Any whitespace at the beginning or end is trimmed away. Programs are stored in the local storage of the browser. After saving a program, it appears in the <em>Program</em> dropdown menu and is remembered as the last used program.</td></tr><tr><th>Program</th><td>Lists all stored programs. Initially, the last saved or loaded program is restored. Selecting a program from this list does not perform any action, but the buttons <em>Load</em> and <em>Remove</em> will act on the selected program.</td></tr><tr><th>Load</th><td>Loads the program, that is currently selected in the <em>Program</em> dropdown menu. It replaces the content of the textareas <em>Definitions</em> and <em>Expression</em> by that of the selected program, so make sure to save your work first. The loaded program is remembered as the last used program.</td></tr><tr><th>Remove</th><td>Removes the program, that is currently selected in the <em>Program</em> dropdown menu, from the local storage of the browser and therefore also from the list of programs.</td></tr><tr><th>Definitions</th><td>Main textarea for writing programs. The tutorial {PROBLEM:Symbols} gives a first introduction to <em>definitions</em> and how they are used.</td></tr><tr><th>Expression</th><td>While <em>Definitions</em> contains the main program logic, <em>Expression</em> contains the actual code to evaluate. The tutorial {PROBLEM:Symbols} gives a first introduction to the functional programming language and how to write expressions.</td></tr><tr><th>Compile</th><td>Compiles any code entered into <em>Definitions</em> and <em>Expression</em>. On success, the program is ready to be run via <em>Evaluate</em>. Also, all referenced symbols (see {PROBLEM:Symbols}) are listed in the <em>Symbol</em> dropdown menu. If your code contains syntactic errors, the <em>Error</em> message box appears with detailed information.</td></tr><tr><th>Evaluate</th><td>After successful compilation, it evaluates the code from <em>Expression</em>. On success, the result is shown in the <em>Evaluation</em> box. If a runtime error occurs, the <em>Error</em> box appears with the complete stacktrace.</td></tr><tr><th>Symbol</th><td>After successful compilation, it shows a list of all symbols (see {PROBLEM:Symbols}), that appear in the code, in lexicographic order. Each entry from the dropdown menu contains the name of the symbol, the number of usages in parenthesis, and optionally an asterisk, if the symbol is not defined in <em>Definitions</em>, so is either undefined (see {PROBLEM:Symbols}), any of the predefined symbols (see {PROBLEM:Lists} and {PROBLEM:Conditions}) or any symbol defined for a specific problem if one is selected. Selecting an entry from this dropdown menu will show all of its usages in the <em>Usage</em> dropdown menu. If the selected entry refers to a self-defined symbol (so without an asterisk), the corresponding section in the code is marked.</td></tr><tr><th>Usage</th><td>Shows all usages of the symbol, that is currently selected in the <em>Symbol</em> dropdown menu, in the order they appear in the code. Each entry contains the number of the usage, and, if it is located within the definition of another symbol, the name of this symbol is included as well. Otherwise, the usage is located in <em>Expression</em> and no symbol name is included. Optionally, an asterisk is appended to the name if the symbol usage belongs to problem specific definitions. Selecting an entry from <em>Usage</em> without an asterisk marks the corresponding section in the code.</td></tr><tr><th>Previous</th><td>Selects the usage, that comes before the currently selected usage in the <em>Usage</em> dropdown menu, or the last usage if the first one is currently selected.</td></tr><tr><th>Next</th><td>Selects the usage, that comes after the currently selected usage in the <em>Usage</em> dropdown menu, or the first usage if the last one is currently selected.</td></tr><tr><th>Indent</th><td>Allows to adjust the formatting of lists (see {PROBLEM:Lists}) presented in the <em>Evaluation</em> box. The selected value from this dropdown menu specifies the indentation level. A value of 1 means: if the evaluation result is a list, each of its elements is written on a separate, single line, indented one level. A value of 2 means: if the evaluation result is a list, that contains lists, then the elements of those inner lists are each written on a separate line and indented two levels. Greater values in the dropdown menu are handled accordingly. The number of indentation levels, that are listed in the dropdown menu, depends on the deepest level of nested lists in the evaluation result.</td></tr><tr><th>Evaluation</th><td>This box is only visible after running the program successfully using <em>Evaluate</em>. It then shows the evaluation result.</td></tr><tr><th>Error</th><td>This box is only visible after compiling or evaluating failed. In this case, it contains the error information. Clicking on those information marks the corresponding code section. If the error occurred during evaluation, the stacktrace is appended as well, which is the list of nested evaluations. For each of those evaluations, the symbol name and the corresponding argument is shown.</td></tr></table>"
			),
			new problem.Statement(
				"Symbols",
				"<p>This tutorial gives an introduction to the functional programming language and is about <em>symbols</em>, one of the two data types, that the language consists of. A symbol is like a function in other programming languages, but it receives exactly one argument when it is evaluated. If you need to pass multiple arguments to a symbol, you need to put them into a list, which you will learn more about in the tutorial {PROBLEM:Lists}.</p><p>Symbols are defined in the textarea below, labelled as <em>Definitions</em>. A definition starts with the symbol name, which must consist of characters from <code>a-z, A-Z, 0-9, -</code> and must be at least one character long. So no whitespace is allowed in symbol names. It is followed by the <code>=</code> character and the expression to evaluate, when the symbol is evaluated. The definition is terminated by the <code>.</code> character, after which another symbol definition may follow.</p><p>Let's have a look at a first example of a definition:<pre>a = b.</pre>In this example, a symbol named <code>a</code> is defined as symbol <code>b</code>, which is not yet defined. It may be left undefined. In this case, it cannot be evaluated but still be used as argument or result of evaluations. The <code>*</code> character can be used to refer to the argument passed in a symbol evaluation as in the following example:<pre>a = *.</pre>Here, symbol <code>a</code> is defined as the argument and therefore acts like the identity function. Note, that the <code>*</code> can only be used in definitions, but not in the <em>Expression</em> textarea. To evaluate a symbol, write the symbol and argument separated by whitespace as in the following example:<pre>a = b c.</pre>Here, <code>a</code> is defined as evaluating <code>b</code> with symbol <code>c</code> as argument. Therefore, <code>b</code> must be a defined symbol, while <code>c</code> may be left undefined. Evaluations can be chained as in:<pre>a = b c d.</pre>Here, <code>c</code> is evaluated with argument <code>d</code> first and the result is used as argument for evaluating <code>b</code>. The order of evaluation can be changed using parenthesis as in:<pre>a = (b c) d.</pre>Here, <code>b</code> is evaluated with argument <code>c</code> first, whose result is expected to be a defined symbol, which is then evaluated with argument <code>d</code>. There are predefined symbols described in the next tutorials, which provide basic operations on the <em>list</em> data type. They can be used in the same way as symbols defined by yourself, but you are not allowed to define symbols with the same name as one of those predefined symbols.</p><p>The next section contains a first exercise. Define symbols <code>a</code>, <code>b</code> and <code>c</code>, such that the expressions evaluate to the corresponding expected values.</p>",
				[
					new problem.Instance("a b", "b"),
					new problem.Instance("b a", "a"),
					new problem.Instance("(b c) a", "a"),
					new problem.Instance("((b a) c) 0", "d")
				]
			),
			new problem.Statement(
				"Lists",
				"<p>In the tutorial {PROBLEM:Symbols} you learned about one data type of the programming language and got a first introduction to the language itself. This tutorial here focuses on the other data type, that the language consists of, which is <em>lists</em>. A list is simply an ordered sequence of other lists or symbols and therefore very similar to data structures like arrays, as you may know them from other programming languages.</p><p>A list expression starts with <code>[</code>, which is followed by the element expressions, of which each two consecutive are separated by <code>,</code> and ends with <code>]</code>. Example:<pre>a = [b, c, d].</pre>Here, <code>a</code> is defined as a list, whose elements are the symbols <code>b</code>, <code>c</code> and <code>d</code>. Lists can be nested arbitrarily as in the following example:<pre>a = [[b, [c], []], d].</pre>Here, <code>a</code> is defined as a list of two elements, whose first element is a list of three elements, whose third element is an empty list. In the tutorial {PROBLEM:Symbols} you learned how to evaluate symbols with another symbol as argument. Of course, a list can also be used as argument as you can see in:<pre>a = b [c, d].</pre>Here, <code>b</code> is evaluated with a list as argument, which contains symbols <code>c</code> and <code>d</code> as elements. There are predefined symbols, which operate on lists. One of them is <code>head</code>, which obtains the first element of a list as in:<pre>a = head [b, c].</pre>Here, evaluating <code>a</code> will obtain the first element of the given list, which is <code>b</code>. Evaluating <code>head</code> with a symbol or an empty list as argument will lead to a runtime error. Also note, that there is no so called <em>lazy evaluation</em>. Example: <pre>a = head [b, head []].</pre>Here, one might expect <code>a</code> to evaluate to <code>b</code>, but it will actually lead to a runtime error, as the second list element is also attempted to be evaluated. As the counterpart to <code>head</code>, there is the predefined symbol <code>tail</code>, which removes the first element from a list as in:<pre>a = tail [b, c, d].</pre>Here, evaluating <code>a</code> results in a list consisting of elements <code>c</code> and <code>d</code>. Again, a runtime error would occur, when evaluated with a symbol or an empty list as argument. There is also a predefined symbol to concatenate lists. It is named <code>flat</code>, expects a list of lists as argument and joins all of those inner lists as in:<pre>a = flat [[b], [c, d], []].</pre>Here, evaluating <code>a</code> will concatenate the lists <code>[b]</code>, <code>[c, d]</code> and <code>[]</code> and therefore results in <code>[b, c, d]</code>. Evaluating <code>flat</code> with an argument, that is a symbol or a list containing symbols, will lead to a runtime error. Note, that lists and symbols are the only data types, so there are no integers and therefore, there is no easy way to access list elements by index. There are a few more predefined symbols, which you will learn about in the tutorial {PROBLEM:Conditions}.</p><p>The next section contains an exercise for this tutorial. Define symbols <code>a</code>, <code>b</code>, <code>c</code> and <code>d</code>, such that the expressions evaluate to the corresponding expected values.</p>",
				[
					new problem.Instance("(a z) [x, y]", "x"),
					new problem.Instance("(a z) [y]", "y"),
					new problem.Instance("head b x", "x"),
					new problem.Instance("b a x", "[head, tail]"),
					new problem.Instance("c [x, y, z]", "y"),
					new problem.Instance("c b x", "tail"),
					new problem.Instance("d [x]", "[x, x]"),
					new problem.Instance("d [y, z]", "[y, z, y, z]")
				]
			),
			new problem.Statement(
				"Conditions",
				"<p>This last tutorial explains how to achieve conditional behavior, as it exists in many programming languages in form of an <em>if</em>-statement or the termination condition of loops. As you have learned in the previous tutorials, symbols and lists are the only data types. So there is no type to represent the value of a condition. Instead, predefined symbols <code>false</code> and <code>true</code> exist, which are defined as:<pre>false = true.\ntrue = *.</pre>Given these symbols, there is the predefined symbol <code>exists</code>, which checks if a given list is non-empty. So the expression <pre>exists [a, b, c]</pre> evaluates to symbol <code>true</code>, while the expression <pre>exists []</pre> evaluates to symbol <code>false</code>. Evaluating <code>exists</code> with a symbol as argument will lead to a runtime error. The introduction of this symbol does not only allow conditional behavior in an <em>if-then-else</em> like expression (see {PROBLEM:If-Then-Else}), but also loops by using recursion (see {PROBLEM:Last Element} as a first example). It therefore makes <em>LiSymP</em> a <em>Turing Complete</em> language.</p><p>The next section contains an exercise for this tutorial. Define symbols <code>a</code>, <code>b</code>, <code>c</code> and <code>d</code>, such that the expressions evaluate to the corresponding expected values.</p>",
				[
					new problem.Instance("(a x) y", "true"),
					new problem.Instance("head b x", "exists [y]"),
					new problem.Instance("exists tail b x", "false"),
					new problem.Instance("c [x]", "exists []"),
					new problem.Instance("c [x, y]", "true"),
					new problem.Instance("d b x", "true"),
					new problem.Instance("d tail b x", "false")
				]
			)
		]
	),
	new problem.Group(
		"Basics",
		"B",
		[
			new problem.Statement(
				"If-Then-Else",
				"<p>In Tutorial {PROBLEM:Conditions} you learned about the predefined symbols <code>false</code> and <code>true</code> to express a boolean value. While most programming languages offer some kind of an <em>if-then-else</em> control structure, <em>LiSymP</em> does not do so out of the box. But we can define such a structure using the fact, that <code>false</code> evaluates to <code>true</code> and <code>true</code> evaluates to its argument.</p><p>Define a symbol named <code>if</code>, which takes a list as argument, consisting of three elements. If the first element is <code>true</code>, then <code>if</code> should evaluate to the second list element. If the first element is <code>false</code>, then it should evaluate to the third list element.</p>",
				[
					new problem.Instance("if [true, a, b]", "a"),
					new problem.Instance("if [false, a, b]", "b")
				]
			),
			new problem.Statement(
				"Last Element",
				"<p>Most programming languages offer some kind of loop control structure. <em>LiSymP</em>, as a functional programming language, achieves this by recursion. Together with the predefined symbol <code>exists</code> and a structure similar to the one in {PROBLEM:If-Then-Else}, termination of the recursion can be controlled. But keep in mind, that there is no lazy evaluation, so evaluating something like <pre>a = if [exists *, a tail *, b].</pre> leads to a runtime error, because in the last recursion step, when the argument is an empty list, <code>a tail *</code> is still evaluated. Instead, you might follow the following pattern:<pre>a = (if [exists *, aa, bb]) *.\naa = a tail *.\nbb = b.</pre></p><p>Now define a symbol named <code>last</code> in a similar way, which takes a non-empty list as argument and evaluates to the last element of this list.</p>",
				[
					new problem.Instance("last [a]", "a"),
					new problem.Instance("last [a, b, c]", "c"),
					new problem.Instance("last [a, b, c, d, e, f]", "f")
				]
			),
			new problem.Statement(
				"Reverse Lists",
				"<p>Define a symbol named <code>reverse</code>, which takes a list as argument and evaluates to a list with the elements in reverse order.</p>",
				[
					new problem.Instance("reverse [a, b, c]", "[c, b, a]"),
					new problem.Instance("reverse [a]", "[a]"),
					new problem.Instance("reverse []", "[]")
				]
			),
			new problem.Statement(
				"Front Tail",
				"<p><em>LiSymP</em> provides the predefined symbol <code>tail</code>, which obtains a list with the first element removed. Define a similar symbol named <code>front-tail</code>, which instead removes the last element.</p>",
				[
					new problem.Instance("front-tail [a, b, c, d, e, f]", "[a, b, c, d, e]"),
					new problem.Instance("front-tail [a, b, c]", "[a, b]"),
					new problem.Instance("front-tail [a]", "[]")
				]
			),
			new problem.Statement(
				"Odd List Length",
				"<p>Define a symbol named <code>odd</code>, which takes a list as argument and evaluates to <code>true</code>, if the given list has an odd number of elements, or <code>false</code> otherwise.</p>",
				[
					new problem.Instance("odd [a, b, c, d, e, f, g]", "true"),
					new problem.Instance("odd [a, b, c, d]", "false"),
					new problem.Instance("odd [a]", "true"),
					new problem.Instance("odd []", "false")
				]
			)
		]
	),
	new problem.Group(
		"Advanced",
		"A",
		[
			new problem.Statement(
				"Middle Element",
				"<p>In this category, we get to slightly more advanced problems, which require a little more than just a simple iteration over lists. Define a symbol named <code>middle</code>, which takes a list with an odd number of elements as argument and evaluates to the middle element.</p>",
				[
					new problem.Instance("middle [a, b, c, d, e, f, g]", "d"),
					new problem.Instance("middle [a, b, c]", "b"),
					new problem.Instance("middle [a]", "a")
				]
			),
			new problem.Statement(
				"For-Each",
				"<p>Many programming languages provide control structures to run code for each element from a given sequence. We want to achieve a similar behavior in <em>LiSymP</em>. Define a symbol named <code>for-each</code>, which takes a list of two elements as argument. The first element is a list <code>a1</code>, ..., <code>aN</code> and the second element is a symbol <code>b</code>. Then <code>for-each</code> must evaluate to the list <code>b a1</code>, ..., <code>b aN</code>.</p>",
				[
					new problem.Instance("for-each [[[a, b], [c, d], [e, f]], head]", "[a, c, e]"),
					new problem.Instance("for-each [[[a], [], [a, b], [b]], exists]", "[true, false, true, true]"),
					new problem.Instance("for-each [[], a]", "[]")
				]
			),
			new problem.Statement(
				"Filter Lists",
				"<p>In {PROBLEM:For-Each} you were asked to map each element of a list by applying a given symbol to them. Here we want to filter a list instead of mapping the elements. Define a symbol named <code>filter</code>, which takes a list of two elements as argument. The first element is a list <code>a</code> and the second element is a symbol <code>b</code>, which evaluates to <code>false</code> or <code>true</code> for each element of <code>a</code> as argument. Then <code>filter</code> must evaluate to the list <code>a</code> with all elements removed for which <code>b</code> evaluates to <code>false</code>.</p>",
				[
					new problem.Instance("filter [[[a], [], [b, c], [d], []], exists]", "[[a], [b, c], [d]]"),
					new problem.Instance("filter [[[a], [b], [c, d], [e], [f, g, h]], multiple]", "[[c, d], [f, g, h]]"),
					new problem.Instance("filter [[a, b, c, d], evaluate]", "[a, d]")
				],
				"multiple = exists tail *.\nevaluate = * *.\n\na = true.\nb = false.\nc = false.\nd = true."
			),
			new problem.Statement(
				"Interleave Lists",
				"<p>Define a symbol named <code>interleave</code>, which takes a list of two elements as argument, both of which are lists themselves. It must evaluate to the list that interleaves the elements from both lists starting with the first one. The remaining elements of the longer list are simply appended. So for two lists <code>a1</code>, ..., <code>aN</code> and <code>b1</code>, ..., <code>bM</code> with <code>N < M</code>, the resulting list is expected to be <code>a1</code>, <code>b1</code>, <code>a2</code>, <code>b2</code>, ..., <code>aN</code>, <code>bN</code>, <code>b(N+1)</code>, ..., <code>bM</code>.</p>",
				[
					new problem.Instance("interleave [[], []]", "[]"),
					new problem.Instance("interleave [[], [a, b]]", "[a, b]"),
					new problem.Instance("interleave [[a, b, c], [d, e]]", "[a, d, b, e, c]"),
					new problem.Instance("interleave [[a, b], [c, d]]", "[a, c, b, d]"),
					new problem.Instance("interleave [[a, b, c], [d, e, f, g]]", "[a, d, b, e, c, f, g]")
				]
			),
			new problem.Statement(
				"Split Lists",
				"<p>A common operation in other programming languages is splitting a character string by a given character. For example, it allows to extract the values from a string of comma separated values. Define a symbol named <code>split</code>, which takes a list of two elements as argument. The first element is the list <code>a1</code>, ..., <code>aN</code> to split, while the second element is a symbol <code>b</code> specifying which element from the list is considered a separator, so <code>b aI</code> evaluates to either <code>false</code> or <code>true</code> for any index <code>I</code>. Then, <code>split</code> must evaluate to the list whose first element is the list <code>a1</code>, ..., <code>a(N1-1)</code>, where <code>N1</code> is the first index for which <code>b aN1</code> evaluates to <code>true</code>. The second element must be the list <code>a(N1+1)</code>, ..., <code>a(N2-1)</code>, where <code>N2</code> is the second index for which <code>b aN2</code> evaluates to <code>true</code> and so on.</p>",
				[
					new problem.Instance("split [[h, y, p, h, e, n, -, s, e, p, a, r, a, t, e, d, -, v, a, l, u, e, s], apply]", "[[h, y, p, h, e, n], [s, e, p, a, r, a, t, e, d], [v, a, l, u, e, s]]", 1),
					new problem.Instance("split [[true, false, true, true, false, false, false, true, false], identity]", "[[], [false], [], [false, false, false], [false]]", 1),
					new problem.Instance("split [[[1], [2, 3], [], [4], [5], [6, 7, 8], [], [9]], empty]", "[[[1], [2, 3]], [[4], [5], [6, 7, 8]], [[9]]]", 1),
					new problem.Instance("split [[], identity]", "[[]]", 1)
				],
				"apply = * *.\nidentity = *.\nempty = (exists *) false.\n\n- = true.\nh = false.\ny = false.\np = false.\ne = false.\nn = false.\ns = false.\na = false.\nr = false.\nt = false.\nd = false.\nv = false.\nl = false.\nu = false."
			),
			new problem.Statement(
				"Reduce Lists",
				"<p>Sometimes you are given a binary operator and want to apply it to more than just two elements by first applying it to two elements, then to the result and a third element and so on. For example, the logical operator from {PROBLEM:AND} could be generalized this way to check if all elements from a list are <code>true</code>.</p><p>Define a symbol named <code>reduce</code>, which takes a list of three elements as argument. The first element is the list <code>a1</code>, ..., <code>aN</code> to reduce. The second element <code>b</code> is the initial value of the reduction. The third element <code>c</code> is the symbol representing the binary operation. Then <code>reduce</code> must evaluate to <pre>c [c [...[c [c [b, a1], a2], a3]...], aN]</pre></p>",
				[
					new problem.Instance("reduce [[a, b, c, d], 0, identity]", "[[[[0, a], b], c], d]"),
					new problem.Instance("reduce [[tail, tail, head, tail, head], [a, b, [c, d]], apply]", "d")
				],
				"identity = *.\napply = (head tail *) head *."
			),
			new problem.Statement(
				"Sort Lists",
				"<p>A common computational problem is sorting elements by a given comparator. Define a symbol named <code>sort</code>, which takes a list of two elements as argument. The first element is the list of elements to sort. The second element is a symbol implementing the comparator. It takes a list of two elements as argument and returns <code>true</code> if these two elements are already in order, or <code>false</code> if they need to be swapped. It can be assumed, that the comparator defines a unique order on the elements to sort.</p>",
				[
					new problem.Instance("sort [[d, a, e, c, b], alphabetical]", "[a, b, c, d, e]"),
					new problem.Instance("sort [[b, a, e, d], alphabetical]", "[a, b, d, e]"),
					new problem.Instance("sort [[a], alphabetical]", "[a]"),
					new problem.Instance("sort [[], alphabetical]", "[]")
				],
				"alphabetical = ((head *) head) ((second *) second).\n\na = * [a0, [true, false, false, false, false]].\nb = * [b0, [true, true, false, false, false]].\nc = * [c0, [true, true, true, false, false]].\nd = * [d0, [true, true, true, true, false]].\ne = * [e0, [true, true, true, true, true]].\n\na0 = head *.\nb0 = a0 tail *.\nc0 = b0 tail *.\nd0 = c0 tail *.\ne0 = d0 tail *."
			)
		]
	),
	new problem.Group(
		"Logical Operators",
		"L",
		[
			new problem.Statement(
				"NOT",
				"<p>Define a symbol named <code>not</code>, which implements negation on the symbols <code>false</code> and <code>true</code>. So given one of them as argument must evaluate to the other one.</p>",
				[
					new problem.Instance("not false", "true"),
					new problem.Instance("not true", "false")
				]
			),
			new problem.Statement(
				"AND",
				"<p>Define a symbol named <code>and</code>, which takes a list of two elements as argument, both being <code>false</code> or <code>true</code>, and which implements logical conjunction, so evaluates to <code>true</code> if both list elements are <code>true</code>, and otherwise to <code>false</code>.</p>",
				[
					new problem.Instance("and [false, false]", "false"),
					new problem.Instance("and [false, true]", "false"),
					new problem.Instance("and [true, false]", "false"),
					new problem.Instance("and [true, true]", "true")
				]
			),
			new problem.Statement(
				"OR",
				"<p>Define a symbol named <code>or</code>, which takes a list of two elements as argument, both being <code>false</code> or <code>true</code>, and which implements logical disjunction, so evaluates to <code>true</code> if at least one of both elements is <code>true</code>, and otherwise to <code>false</code>.</p>",
				[
					new problem.Instance("or [false, false]", "false"),
					new problem.Instance("or [false, true]", "true"),
					new problem.Instance("or [true, false]", "true"),
					new problem.Instance("or [true, true]", "true")
				]
			),
			new problem.Statement(
				"XOR",
				"<p>Define a symbol named <code>xor</code>, which takes a list of two elements as argument, both being <code>false</code> or <code>true</code>, and which implements exclusive disjunction, so evaluates to <code>true</code> if exactly one of both elements is <code>true</code>, and otherwise to <code>false</code>.</p>",
				[
					new problem.Instance("xor [false, false]", "false"),
					new problem.Instance("xor [false, true]", "true"),
					new problem.Instance("xor [true, false]", "true"),
					new problem.Instance("xor [true, true]", "false")
				]
			),
			new problem.Statement(
				"Implication",
				"<p>Define a symbol named <code>implies</code>, which takes a list of two elements as argument, both being <code>false</code> or <code>true</code>, and which implements logical implication, so evaluates to <code>false</code> if the first element is <code>true</code> and the second element is <code>false</code>, and otherwise evaluates to <code>true</code>.</p>",
				[
					new problem.Instance("implies [false, false]", "true"),
					new problem.Instance("implies [false, true]", "true"),
					new problem.Instance("implies [true, false]", "false"),
					new problem.Instance("implies [true, true]", "true")
				]
			)
		]
	),
	new problem.Group(
		"Arithmetic",
		"R",
		[
			new problem.Statement(
				"Increment",
				"<p>This problem category is about integers, their decimal representation and operations on them. As you have learnt in the tutorials, <em>LiSymP</em> does not provide an integer data type itself. Therefore, we want to compose integers from symbols, that represent decimal digits, by putting them into a list to obtain the decimal representation of an integer. For example, <code>[1, 3, 7]</code> is used to represent the integer 137. Note, that <code>1</code>, <code>3</code> and <code>7</code> are symbols that must be defined appropriately for each problem in this category by yourself.</p><p>Define a symbol named <code>inc</code>, which takes an integer as argument and evaluates to this integer incremented by 1. Both argument and evaluation result are expected to be in the representation described above.</p>",
				[
					new problem.Instance("inc [1, 3, 7, 2, 6]", "[1, 3, 7, 2, 7]"),
					new problem.Instance("inc [5, 8, 4, 9]", "[5, 8, 5, 0]"),
					new problem.Instance("inc [9, 9]", "[1, 0, 0]"),
					new problem.Instance("inc [0]", "[1]")
				]
			),
			new problem.Statement(
				"Add Digit",
				"<p>In the previous problem {PROBLEM:Increment}, you implemented the increment operator as a first step towards the general addition operator for two integers. But before we get there, let's implement adding a single digit to an integer. Define a symbol named <code>add-digit</code>, which takes a list of two elements as argument. The first element is an integer in decimal representation as described in {PROBLEM:Increment}. The second element is a digit, that is one of the symbols <code>0</code>, ..., <code>9</code>. Then <code>add-digit</code> must evaluate to the decimal representation of the integer resulting from adding the digit to the given integer.</p>",
				[
					new problem.Instance("add-digit [[4, 9, 1], 8]", "[4, 9, 9]"),
					new problem.Instance("add-digit [[9, 9, 9, 7], 3]", "[1, 0, 0, 0, 0]"),
					new problem.Instance("add-digit [[5, 6], 9]", "[6, 5]"),
					new problem.Instance("add-digit [[0], 2]", "[2]")
				]
			),
			new problem.Statement(
				"Add Integers",
				"<p>Define a symbol named <code>add</code>, which takes a list of two elements as argument. Both elements must be integers in decimal representation as described in {PROBLEM:Increment}. Then <code>add</code> must evaluate to the decimal representation of the sum of these two integers.</p>",
				[
					new problem.Instance("add [[6, 4, 8], [3, 5, 2]]", "[1, 0, 0, 0]"),
					new problem.Instance("add [[1, 9], [2, 8, 7, 0]]", "[2, 8, 8, 9]"),
					new problem.Instance("add [[7, 4, 5], [3, 6]]", "[7, 8, 1]"),
					new problem.Instance("add [[0], [3]]", "[3]")
				]
			),
			new problem.Statement(
				"Multiply Digit",
				"<p>From addition in the previous problems, we get to another basic arithmetic operation, which is multiplication. Again, we start by multiplying an integer by a digit before we get to the general operation. Define a symbol named <em>multiply-digit</em>, which takes a list of two elements as argument. The first element is an integer in decimal representation as described in {PROBLEM:Increment}. The second element is a digit, that is one of the symbols <code>0</code>, ..., <code>9</code>. Then <code>multiply-digit</code> must evaluate to the decimal representation of the integer resulting from multiplying the given integer by the digit.</p>",
				[
					new problem.Instance("multiply-digit [[5, 9, 6], 7]", "[4, 1, 7, 2]"),
					new problem.Instance("multiply-digit [[1, 0, 3], 3]", "[3, 0, 9]"),
					new problem.Instance("multiply-digit [[7, 9], 1]", "[7, 9]"),
					new problem.Instance("multiply-digit [[8, 4, 2], 0]", "[0]"),
					new problem.Instance("multiply-digit [[0], 6]", "[0]")
				]
			),
			new problem.Statement(
				"Multiply Integers",
				"<p>Define a symbol named <code>multiply</code>, which takes a list of two elements as argument. Both elements must be integers in decimal representation as described in {PROBLEM:Increment}. Then <code>multiply</code> must evaluate to the decimal representation of the product of these two integers.</p>",
				[
					new problem.Instance("multiply [[6, 5, 9], [1]]", "[6, 5, 9]"),
					new problem.Instance("multiply [[0], [1, 7]]", "[0]"),
					new problem.Instance("multiply [[2, 1], [3, 5]]", "[7, 3, 5]"),
					new problem.Instance("multiply [[7, 8, 4], [9, 3, 1, 4]]", "[7, 3, 0, 2, 1, 7, 6]"),
					new problem.Instance("multiply [[7], [5]]", "[3, 5]")
				]
			),
			new problem.Statement(
				"Less Than",
				"<p>Another common operation on integers is to compare if one integer is less than another one. Define a symbol named <code>less</code>, which takes a list of two elements as argument, both of which are decimal representations of integers as described in {PROBLEM:Increment}, and evaluates to <code>true</code>, if the first integer is less than the second one, and otherwise to <code>false</code>.</p>",
				[
					new problem.Instance("less [[7, 3, 9], [1, 0, 3, 8]]", "true"),
					new problem.Instance("less [[1, 5], [9]]", "false"),
					new problem.Instance("less [[8, 5, 3], [8, 5, 0]]", "false"),
					new problem.Instance("less [[4, 6], [4, 6]]", "false"),
					new problem.Instance("less [[2], [6]]", "true")
				]
			),
			new problem.Statement(
				"List Length",
				"<p>Define a symbol named <code>length</code>, which takes a list as argument and evaluates to an integer in decimal representation as described in {PROBLEM:Increment}, that is equal to the number of elements of the given list.</p>",
				[
					new problem.Instance("length []", "[0]"),
					new problem.Instance("length [a]", "[1]"),
					new problem.Instance("length [a, b, c]", "[3]"),
					new problem.Instance("length [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]", "[1, 6]")
				]
			),
			new problem.Statement(
				"Element Index",
				"<p>In most programming languages, you can access list elements by index. <em>LiSymP</em> does not offer this by default, but as we introduced integers in the previous problems, we can implement this functionality now. Define a symbol named <code>by-index</code>, which takes a list of two elements as argument, of which the first one is a list and the second one is an integer in decimal representation as described in {PROBLEM:Increment}. Then <code>by-index</code> must evaluate to the element of the list at the position given by the integer, where 0 is the first element.</p>",
				[
					new problem.Instance("by-index [[a, b, c, d, e, f], [3]]", "d"),
					new problem.Instance("by-index [[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], [1, 2]]", "M"),
					new problem.Instance("by-index [[X, Y, Z], [0]]", "X"),
					new problem.Instance("by-index [[a, b, c, d, e, f], [5]]", "f")
				]
			)
		]
	),
	new problem.Group(
		"Trees",
		"T",
		[
			new problem.Statement(
				"Tree Equality",
				"<p>A common data structure in algorithms is the <em>Tree</em>. We focus on different kinds of tree structures and related problems in this category. Let's have a look at a general tree structure only composed of nested lists without any symbols involved. So empty lists represent leaves in such a structure, while non-empty lists contain the children of this node.</p><p>Define a symbol named <code>tree-equal</code>, which takes a list of two elements as argument, of which both are trees according to the definition above. It must evalute to <code>true</code>, if the given trees are equal, and otherwise to <code>false</code>.</p>",
				[
					new problem.Instance("tree-equal [[], []]", "true"),
					new problem.Instance("tree-equal [[], [[]]]", "false"),
					new problem.Instance("tree-equal [[[[]], []], [[], [[]]]]", "false"),
					new problem.Instance("tree-equal [[[], [[[]], []]], [[], [[[]], []]]]", "true"),
					new problem.Instance("tree-equal [[[[]]], [[[[]]]]]", "false")
				]
			),
			new problem.Statement(
				"Tree Depth",
				"<p>Again, we consider the tree structure described in {PROBLEM:Tree Equality}. We want to compute the tree depth which is the maximum number of nested lists. An empty list has depth 0. A list containing an empty list has depth 1 and so on. Define a symbol named <code>depth</code>, which takes a list as argument, that does not contain symbols on any level. It must evaluate to an integer in decimal representation as described in {PROBLEM:Increment}, that is equal to the depth of the given tree.</p>",
				[
					new problem.Instance("depth []", "[0]"),
					new problem.Instance("depth [[]]", "[1]"),
					new problem.Instance("depth [[], []]", "[1]"),
					new problem.Instance("depth [[[]], [[], [[]]]]", "[3]"),
					new problem.Instance("depth [[[[], [[]]], []], [[[]]]]", "[4]"),
					new problem.Instance("depth [[[[[[[[[[[]]]]]]]]]]]", "[1, 0]")
				]
			),
			new problem.Statement(
				"Count Leaves",
				"<p>Again, we consider the tree structure described in {PROBLEM:Tree Equality}. Now we want to compute the number of leaves of a given tree, that is the number of empty lists in the structure of nested lists. Define a symbol named <code>leaves</code>, which takes a list as argument, that does not contain symbols on any level. It must evaluate to an integer in decimal representation as described in {PROBLEM:Increment}, that is equal to the number of leaves of the given tree.</p>",
				[
					new problem.Instance("leaves []", "[1]"),
					new problem.Instance("leaves [[]]", "[1]"),
					new problem.Instance("leaves [[], []]", "[2]"),
					new problem.Instance("leaves [[[]], [[], [[], []]]]", "[4]"),
					new problem.Instance("leaves [[[[], [[]]], []], [[[]]], []]", "[5]"),
					new problem.Instance("leaves [[], [], [[], []], [], [], [[], [], [], []], [], []]", "[1, 2]")
				]
			),
			new problem.Statement(
				"Flatten Binary Trees",
				"<p>The tree structure described in {PROBLEM:Tree Equality} lacks the ability to store actual data at the leaves. Therefore, we want to consider a binary tree structure which is also defined by nested lists. But those lists may consist of either one or two elements. A list of a single element represents a leaf node and this single element represents the data attached to it. A list of two elements represents an inner node whose two children are represented by the two elements.</p><p>Define a symbol named <code>flat-tree</code>, which takes a binary tree as argument and evaluates to the list of data at the leaf nodes in the order they appear in the tree from left to right.</p>",
				[
					new problem.Instance("flat-tree [a]", "[a]"),
					new problem.Instance("flat-tree [[X], [Y]]", "[X, Y]"),
					new problem.Instance("flat-tree [[[A], [B]], [[[C], [D]], [E]]]", "[A, B, C, D, E]"),
					new problem.Instance("flat-tree [[[1], [[[2], [[3], [4]]], [5]]], [6]]", "[1, 2, 3, 4, 5, 6]")
				]
			)
		]
	)
];