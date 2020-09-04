echo "Aligning DNA-1000..."
cat dna-1000.txt | xargs align -g 5,1 -m 2,-1
echo "Aligning DNA-10000..."
cat dna-10000.txt | xargs align -g 5,1 -m 2,-1
echo "Aligning Protein-1000..."
cat protein-1000.txt | xargs align -m blosum62
echo "Aligning Protein-10000..."
cat protein-10000.txt | xargs align -m blosum62
