#!/usr/bin/env python3

import json
import os.path

output_path = os.path.join(os.path.dirname(__file__), 'data.json')

with open(output_path, 'w') as f:
	print('[', file=f)

	for codepoint in range(0x000000, 0x10ffff + 1):
		error = 0xd800 <= codepoint <= 0xdfff

		if error:
			symbol = '\N{REPLACEMENT CHARACTER}'
		else:
			symbol = chr(codepoint)

		j = json.dumps({
			'codePoint': codepoint,
			'decoded': symbol,
			'encoded': list(symbol.encode('utf-8')),
			**{'error': True} if error else {},
		})
		fmt = '\t{}' if codepoint == 0x10ffff else '\t{},'

		print(fmt.format(j), file=f)

	print(']', file=f)
