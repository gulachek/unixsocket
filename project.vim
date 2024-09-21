set path=,,src/**,include/**

" build
nnoremap <Leader>b :!node make.mjs<CR>
nnoremap <Leader>c :!rm -rf build<CR>
