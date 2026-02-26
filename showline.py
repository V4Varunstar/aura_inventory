line = open('services/firebaseService.ts').read().splitlines()[801]
print(line)
for idx,ch in enumerate(line):
    if idx<100: print(idx,ch)
