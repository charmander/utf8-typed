#!/usr/bin/env python3

import json
import os.path

output_path = os.path.join(os.path.dirname(__file__), 'data.json')

with open(output_path, 'w') as f:
	print('[', file=f)

	for codepoint in range(0x000000, 0x10ffff + 1):
		# Skip non-scalar values.
		if 0xd800 <= codepoint <= 0xdfff:
			continue

		symbol = chr(codepoint)
		j = json.dumps({
			'codePoint': codepoint,
			'decoded': symbol,
			'encoded': list(symbol.encode('utf8')),
		})
		fmt = '\t{}' if codepoint == 0x10ffff else '\t{},'

		print(fmt.format(j), file=f)

	print(']', file=f)
