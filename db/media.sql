-- Exemples du chapitre 19 du livre 'NSI Terminale 24 Leçons et exercices'

-- Titres de tous les livres publiés après 1990
SELECT titre FROM livre WHERE annee >= 1990;


-- Titres de tous les livres publiés par Dargaud entre 1970 et 1980
SELECT titre FROM livre WHERE annee >= 1970 AND
                                annee <= 1980 AND
                                editeur = 'Dargaud';


-- Titres des livres contenant 'Astérix'
SELECT titre FROM livre WHERE titre LIKE '%Astérix%';
