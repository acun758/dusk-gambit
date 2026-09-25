update public.matches set status='abort', rating_delta=0, black_delta=0 where id='70b34399-738d-403b-b67f-987897cdbab2';
update public.profiles set elo=1231, wins=2, losses=0, provisional_games=greatest(provisional_games-1,0) where id='07f78911-b36f-4c2e-bc6a-ec166fe457be';
update public.profiles set elo=903, wins=7, losses=26 where id='715b6bf4-7fda-4832-8942-6f24553dd8ab';